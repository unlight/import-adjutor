import assert from 'assert';
import { resolve } from 'path';
import { Project } from 'ts-morph';

import { createProject } from './create-project';

function normalizeFileList(project: Project) {
    return project
        .getSourceFiles()
        .map((s) => s.getFilePath())
        .map((path) => {
            return path.slice(resolve(__dirname, '..').length);
        });
}

describe('create-project', () => {
    let project: Project;
    describe('checking files (cannot modify allowJS)', () => {
        it.skip('must include javascript with tsconfig', async () => {
            project = await createProject({
                directory: `${__dirname}/..`,
                compilerOptions: {
                    allowJs: true,
                },
            });
            const files = normalizeFileList(project);
            assert(files.find((file) => file.endsWith('src/bin.js')));
        });
    });

    describe('folder exclude patterns', () => {
        let result: string[];
        let project: Project;

        beforeEach(() => {
            result = undefined as any;
            project = undefined as any;
        });

        describe('file in directory should be kept, but not deeper', () => {
            function verify(project: Project) {
                const result = normalizeFileList(project);
                assert(
                    !result.includes('/fixtures/playground/test-ignore/ignore-me.ts'),
                    'file `test-ignore/ignore-me` should be ignored',
                );
                assert(
                    result.includes('/fixtures/playground/resolve.ts'),
                    'resolve.ts should be kept',
                );
                assert(
                    result.includes('/fixtures/playground/playground.ts'),
                    'playground.ts should be kept',
                );
            }

            it('ends with slash', async () => {
                project = await createProject({
                    directory: `${__dirname}/../fixtures`,
                    folderExcludePatterns: ['fixtures/playground/'],
                });
                verify(project);
            });

            it('ends with single star', async () => {
                project = await createProject({
                    directory: `${__dirname}/../fixtures`,
                    folderExcludePatterns: ['playground/*'],
                });
                verify(project);
            });
        });

        describe('complete exclude folder', () => {
            const verify = (project: Project) => {
                result = normalizeFileList(project);
                assert.strict.deepEqual(
                    result.filter((s) => s.startsWith('/fixtures/playground')),
                    [],
                );
            };

            it('not ending slash', async () => {
                project = await createProject({
                    directory: `${__dirname}/../fixtures`,
                    folderExcludePatterns: ['fixtures/playground'],
                });
                verify(project);
            });

            it('folder name', async () => {
                project = await createProject({
                    directory: `${__dirname}/../fixtures`,
                    folderExcludePatterns: ['playground'],
                });
                verify(project);
            });
        });

        it('one letter pattern', async () => {
            project = await createProject({
                directory: `${__dirname}/../fixtures`,
                folderExcludePatterns: ['f'],
            });
            result = normalizeFileList(project);
            assert(
                result.includes('/fixtures/folder/file.ts'),
                'pattern must be more stronger and not remove all',
            );
        });
    });

    it.skip('root directory stack overflow', async () => {
        project = await createProject({
            directory: `c:`,
        });
    });
});
