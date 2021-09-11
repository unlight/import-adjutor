import assert from 'assert';
import { Project } from 'ts-morph';

import { createProject } from './create-project';
import { Entry } from './entry';
import { exportsFromDirectory } from './exports-from-directory';

describe('exportsFromDirectory', () => {
    function normalizeFileList(project: Project) {
        return project
            .getSourceFiles()
            .map(s => s.getFilePath())
            .map(path => path.slice(process.cwd().length));
    }

    describe('memory file system', () => {
        let project: Project;

        beforeEach(() => {
            project = new Project({
                compilerOptions: {
                    esModuleInterop: true,
                },
                skipFileDependencyResolution: true,
                skipAddingFilesFromTsConfig: true,
                useInMemoryFileSystem: true,
            });
        });

        it('files in directory', async () => {
            project
                .createSourceFile('/src/source1.ts', `export const foo1 = 1`)
                .saveSync();
            project
                .createSourceFile('/src/source2.tsx', `export const foo2 = 2`)
                .saveSync();
            const result = await exportsFromDirectory({ project, directory: '/src' });
            assert.deepStrictEqual(result, [
                new Entry({
                    filepath: '/src/source1.ts',
                    name: 'foo1',
                }),
                new Entry({
                    filepath: '/src/source2.tsx',
                    name: 'foo2',
                }),
            ]);
        });

        it('in sub directory', async () => {
            project
                .createSourceFile('/src/source1.ts', `export const foo1 = 1`)
                .saveSync();
            project
                .createSourceFile('/src/subdir1/source3.tsx', `export const foo3 = 3`)
                .saveSync();
            const result = await exportsFromDirectory({ project, directory: '/src' });
            assert.deepStrictEqual(result, [
                new Entry({
                    filepath: '/src/source1.ts',
                    name: 'foo1',
                }),
                new Entry({
                    filepath: '/src/subdir1/source3.tsx',
                    name: 'foo3',
                }),
            ]);
        });

        it('entry default', async () => {
            project.createSourceFile('/src/source.ts', `export default def`).saveSync();
            const result = await exportsFromDirectory({ project, directory: '/src' });
            assert.strict.deepEqual(result, [
                new Entry({
                    filepath: '/src/source.ts',
                    isDefault: true,
                    name: 'def',
                }),
            ]);
        });

        it('typescript commonjs default export', async () => {
            project.createSourceFile('/src/source.ts', `export = def`).saveSync();
            const result = await exportsFromDirectory({ project, directory: '/src' });
            assert.strict.deepEqual(result, [
                new Entry({
                    name: 'def',
                    filepath: '/src/source.ts',
                    isDefault: true,
                }),
            ]);
        });
    });

    describe('real file system', () => {
        it('real subdirectories', async () => {
            const result = (await exportsFromDirectory({ directory: 'fixtures' })).find(
                entry =>
                    entry.filepath!.endsWith(
                        'fixtures/subdirectory/subdirectory-file.ts',
                    ),
            );
            assert(result);
            assert.equal(result.name, 'subdirectoryFile');
            assert.equal(result.isDefault, false);
            assert(result.module === undefined);
        });

        it('ignore file patterns', async () => {
            const options = {
                fileExcludePatterns: ['*.sublime-workspace', 'ignored-*'],
            };
            const result = await exportsFromDirectory({
                directory: `${__dirname}/../fixtures`,
                ...options,
            });
            assert.ok(
                !result.find(
                    entry =>
                        entry.filepath &&
                        entry.filepath.endsWith('fixtures/ignored-file.ts'),
                ),
            );
        });

        it('ignore folders patterns', async () => {
            const options = {
                folderExcludePatterns: ['ignored-*', '.svn', '.git', '.hg', 'CVS'],
            };
            const result = await exportsFromDirectory({
                directory: 'fixtures',
                ...options,
            });

            assert.ok(
                !result.find(
                    entry =>
                        entry.filepath &&
                        entry.filepath.endsWith('ignored-directory/ignored-file.ts'),
                ),
                'ignored-directory should be ignored',
            );

            assert.ok(
                !result.find(
                    entry =>
                        entry.filepath &&
                        entry.filepath.endsWith('fixtures/.svn/ignored-file.ts'),
                ),
                'folder equal name should be ignored',
            );
        });

        it('javascript files should have exports', async () => {
            const result = await exportsFromDirectory({
                directory: 'fixtures/second-folder',
            });
            assert(result.find(entry => entry.name === 'secondFolderFile'));
        });

        it('tsx file', async () => {
            const result = await exportsFromDirectory({
                directory: 'fixtures/playground',
            });
            assert(result.find(entry => entry.name === 'TsxComp'));
        });
    });
});
