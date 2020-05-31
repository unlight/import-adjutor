import { Project } from 'ts-morph';
import { exportsFromDirectory } from './exports-from-directory';
import assert from 'assert';
import { Entry } from './entry';

describe('exportsFromDirectory', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            compilerOptions: {
                esModuleInterop: true,
            },
            skipFileDependencyResolution: true,
            addFilesFromTsConfig: false,
            useInMemoryFileSystem: true,
        });
    });

    it('files in directory', async () => {
        project.createSourceFile('/src/source1.ts', `export const foo1 = 1`).saveSync();
        project.createSourceFile('/src/source2.tsx', `export const foo2 = 2`).saveSync();
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
        project.createSourceFile('/src/source1.ts', `export const foo1 = 1`).saveSync();
        project.createSourceFile('/src/subdir1/source3.tsx', `export const foo3 = 3`).saveSync();
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
        assert.deepStrictEqual(result, [
            new Entry({
                filepath: '/src/source.ts',
                isDefault: true,
                name: 'def',
            }),
        ]);
    });

    describe('real file system', () => {
        beforeEach(() => {
            project = new Project({
                compilerOptions: {
                    esModuleInterop: true,
                },
                skipFileDependencyResolution: true,
                addFilesFromTsConfig: false,
                useInMemoryFileSystem: false,
            });
        });

        it.only('real subdirectories', async () => {
            const result = (
                await exportsFromDirectory({ project, directory: 'fixtures' })
            ).find((entry) =>
                entry.filepath!.endsWith('fixtures/subdirectory/subdirectory-file.ts'),
            );
            assert(result);
            assert.equal(result.name, 'subdirectoryFile');
            assert.equal(result.isDefault, false);
            assert.equal(result.module, undefined);
        });
    });
});
