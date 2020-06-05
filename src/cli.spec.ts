import { execSync, SpawnSyncReturns } from 'child_process';
import assert from 'assert';
import { insertImport } from './insert-import';

const node = 'node -r ts-node/register/transpile-only';

describe('cli', () => {
    it('empty command', () => {
        try {
            const result = execSync(`${node} ${__dirname}/cli.ts`, {
                input: JSON.stringify({}),
                encoding: 'utf8',
                stdio: ['pipe', 'ignore', 'pipe'],
            });
            assert.fail('empty command should fail');
        } catch (e) {
            const error: SpawnSyncReturns<string> = e;
            assert(error.stderr.includes('Error: Empty command'));
            assert.notEqual(error.status, 0);
        }
    });

    it('insert command', () => {
        let result: any = execSync(`${node} ${__dirname}/cli.ts`, {
            input: JSON.stringify({
                command: 'insertImport',
                args: {
                    declaration: {
                        name: 'copy',
                        specifier: 'fs',
                    },
                    sourceFileContent: ``,
                } as Parameters<typeof insertImport>['0'],
            }),
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        result = JSON.parse(result);
        assert.equal(result, `import { copy } from 'fs';\n`);
    });
});
