import assert from 'assert';
import { execSync, SpawnSyncReturns } from 'child_process';
import { resolve } from 'path';
import expect from 'expect';

import { insertImport } from './insert-import';

const node = 'node -r ts-node/register/transpile-only';
const createExecSync = ({ input }: { input: object }) => {
    const result = execSync(`${node} ${__dirname}/cli.ts`, {
        input: JSON.stringify(input),
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(result);
};

describe('cli', () => {
    it('empty command', () => {
        try {
            const result = createExecSync({ input: {} });
            assert.fail('empty command should fail');
        } catch (_) {
            const error = _ as SpawnSyncReturns<string>;
            assert(error.stderr.includes('Error: Empty command'));
            assert.notEqual(error.status, 0);
        }
    });

    it('unknown command', () => {
        try {
            const result = createExecSync({ input: { command: 'foo' } });
            assert.fail('empty command should fail');
        } catch (_) {
            const error = _ as SpawnSyncReturns<string>;
            assert(error.stderr.includes('Error: Unknown command'));
            assert.notEqual(error.status, 0);
        }
    });

    it('insert command', () => {
        const result = createExecSync({
            input: {
                command: 'insertImport',
                args: {
                    declaration: {
                        name: 'copy',
                        specifier: 'fs',
                    },
                    sourceFileContent: ``,
                } as Parameters<typeof insertImport>['0'],
            },
        });
        assert.equal(result, `import { copy } from 'fs';\n`);
    });

    it('real app from not current directory', () => {
        const directory = resolve(`${__dirname}/../fixtures/nestjs-app`);
        const result = createExecSync({
            input: {
                command: 'exportsNodeModules',
                args: {
                    directory,
                },
            },
        });
        expect(result.some(entry => entry.module === '@nestjs/graphql')).toBeTruthy();
        expect(result.find(entry => entry.name === 'ID')).toBeTruthy();
    });

    it('nestjs app sources', async () => {
        const directory = resolve(`${__dirname}/../fixtures/nestjs-app`);
        const result = createExecSync({
            input: {
                command: 'exportsFromDirectory',
                args: {
                    directory,
                },
            },
        });
        assert(result.find(entry => entry.name === 'nestAppConst'));
    });
});
