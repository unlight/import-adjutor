import { Project, FileSystemHost, Node } from 'ts-morph';
import { extensions } from './constants';
import { Entry } from './entry';

type Arguments = {
    directory: string;
    project: Project;
};

export async function exportsFromDirectory({ directory, project }: Arguments) {
    const fs = project.getFileSystem();
    const directoryFiles = fs.readDirSync(directory);
    const config = directoryFiles.find((file) => ['tsconfig.json', 'jsconfig.json'].includes(file));
    if (config) {
        project.addSourceFilesFromTsConfig(config);
    } else {
        await walkDirectoryFiles({ directoryFiles, project, fs });
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
}: {
    directoryFiles: string[];
    project: Project;
    fs: FileSystemHost;
}) {
    for await (const file of directoryFiles) {
        if (extensions.find((ext) => file.endsWith(ext))) {
            project.addSourceFileAtPath(file);
        } else if (await fs.directoryExists(file)) {
            await walkDirectoryFiles({
                directoryFiles: fs.readDirSync(file),
                project,
                fs,
            });
        }
    }
}
