import micromatch from 'micromatch';
import { FileSystemHost, Node,Project } from 'ts-morph';

import { extensions } from './constants';
import { createProject } from './create-project';
import { Entry } from './entry';
import { sourcefileDefaultExports } from './sourcefile-default-exports';

type Arguments = {
    directory: string;
    project?: Project;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
};

export async function exportsFromDirectory({
    directory,
    folderExcludePatterns,
    fileExcludePatterns,
    project,
}: Arguments) {
    project =
        project ?? (await createProject({ directory, folderExcludePatterns, fileExcludePatterns }));
    const result: Entry[] = [];
    for (let sourceFile of project.getSourceFiles()) {
        const filepath = sourceFile.getFilePath();
        for (let exportSymbol of sourceFile.getExportSymbols()) {
            const name = exportSymbol.getName();
            if (name !== 'default') {
                result.push(new Entry({ name, filepath }));
            }
        }
        const name = sourcefileDefaultExports(sourceFile);
        if (name) {
            result.push(new Entry({ name, filepath, isDefault: true }));
        }
    }
    return result;
}
