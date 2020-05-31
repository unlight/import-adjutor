import { Project, FileSystemHost, Node } from 'ts-morph';
import { extensions } from './constants';
import { Entry } from './entry';
import micromatch from 'micromatch';
import { createProject } from './create-project';

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
        sourceFile.getExportAssignment((exportAssignment) => {
            const expression = exportAssignment.getExpression();
            if (Node.isIdentifier(expression)) {
                const name = String(expression.compilerNode.escapedText);
                result.push(new Entry({ name, filepath, isDefault: true }));
            }
            return false;
        });
    }
    return result;
}
