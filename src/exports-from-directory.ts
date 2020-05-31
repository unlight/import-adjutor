import { Project, FileSystemHost, Node } from 'ts-morph';
import { extensions } from './constants';
import { Entry } from './entry';
import micromatch from 'micromatch';

type Arguments = {
    directory: string;
    project: Project;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
};

export async function exportsFromDirectory({
    directory,
    project,
    folderExcludePatterns,
    fileExcludePatterns,
}: Arguments) {
    const fs = project.getFileSystem();
    const directoryFiles = fs.readDirSync(directory);
    const config = directoryFiles.find((file) => ['tsconfig.json', 'jsconfig.json'].includes(file));
    if (config) {
        project.addSourceFilesFromTsConfig(config);
    } else {
        await walkDirectoryFiles({
            directoryFiles,
            project,
            fs,
            folderExcludePatterns,
            fileExcludePatterns,
        });
    }
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

async function walkDirectoryFiles({
    directoryFiles,
    project,
    fs = project.getFileSystem(),
    folderExcludePatterns,
    fileExcludePatterns,
}: {
    directoryFiles: string[];
    project: Project;
    fs: FileSystemHost;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
}) {
    for await (const file of directoryFiles) {
        if (extensions.find((ext) => file.endsWith(ext))) {
            if (fileExcludePatterns) {
                if (micromatch.isMatch(file, fileExcludePatterns, { contains: true })) {
                    continue;
                }
            }
            project.addSourceFileAtPath(file);
        } else if (await fs.directoryExists(file)) {
            if (folderExcludePatterns) {
                if (micromatch.isMatch(file, folderExcludePatterns, { contains: true })) {
                    continue;
                }
            }
            await walkDirectoryFiles({
                directoryFiles: fs.readDirSync(file),
                project,
                fs,
                folderExcludePatterns,
                fileExcludePatterns,
            });
        }
    }
}
