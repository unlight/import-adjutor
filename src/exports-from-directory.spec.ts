import { Project } from 'ts-morph';
import { exportsFromDirectory } from './exports-from-directory';
import assert from 'assert';

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
        assert.deepStrictEqual(result, ['/src/source1.ts|foo1', '/src/source2.tsx|foo2']);
    });

    it('in sub directory', async () => {
        project.createSourceFile('/src/source1.ts', `export const foo1 = 1`).saveSync();
        project.createSourceFile('/src/subdir1/source3.tsx', `export const foo3 = 3`).saveSync();
        const result = await exportsFromDirectory({ project, directory: '/src' });
        assert.deepStrictEqual(result, ['/src/source1.ts|foo1', '/src/subdir1/source3.tsx|foo3']);
    });
});
