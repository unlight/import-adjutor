import assert from 'assert';
import micromatch from 'micromatch';
import { Project } from 'ts-morph';

import { createProject } from './create-project';

function normalizeFileList(project: Project) {
    return project
        .getSourceFiles()
        .map((s) => s.getFilePath())
        .map((path) => path.slice(process.cwd().length));
}

describe('create-project', () => {
    describe('folder exclude patterns', () => {
        let result: string[];
        let project: Project;

        beforeEach(() => {
            result = undefined as any;
            project = undefined as any;
        });

        describe('file in directory should be kept, but not deeper', () => {
            afterEach(() => {
                result = normalizeFileList(project);
                assert(
                    !result.includes('/fixtures/~playground/test-ignore/a.ts'),
                    'file should be ignored',
                );
                assert(result.includes('/fixtures/~playground/cli.ts'), 'cli.ts should be kept');
                assert(
                    result.includes('/fixtures/~playground/playground.ts'),
                    'playground.ts should be kept',
                );
            });

            it('ends with slash', async () => {
                project = await createProject({
                    directory: 'fixtures',
                    folderExcludePatterns: ['fixtures/~playground/'],
                });
            });

            it('ends with single star', async () => {
                project = await createProject({
                    directory: 'fixtures',
                    folderExcludePatterns: ['~playground/*'],
                });
            });
        });

        describe('complete exclude folder', () => {
            afterEach(() => {
                result = normalizeFileList(project);
                assert.strict.deepEqual(
                    result.filter((s) => s.startsWith('/fixtures/~playground')),
                    [],
                );
            });

            it('not ending slash', async () => {
                project = await createProject({
                    directory: 'fixtures',
                    folderExcludePatterns: ['fixtures/~playground'],
                });
            });

            it('folder name', async () => {
                project = await createProject({
                    directory: 'fixtures',
                    folderExcludePatterns: ['~playground'],
                });
            });
        });
    });
});
