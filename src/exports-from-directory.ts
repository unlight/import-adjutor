import { Project } from 'ts-morph';
import { extensions } from './constants';

type Arguments = {
    directory: string;
    project: Project;
};

export async function exportsFromDirectory({ directory, project }: Arguments) {
    const fs = project.getFileSystem();
    const directoryFiles = fs.readDirSync(directory);
    const config = directoryFiles.find((file) => {
        return ['tsconfig.json', 'jsconfig.json'].includes(file);
    });
    if (config) {
        project.addSourceFilesFromTsConfig(config);
    } else {
        const walkDirectoryFiles = async (directoryFiles: string[]) => {
            for await (const file of directoryFiles) {
                if (extensions.find((ext) => file.endsWith(ext))) {
                    project.addSourceFileAtPath(file);
                } else if (await fs.directoryExists(file)) {
                    walkDirectoryFiles(fs.readDirSync(file));
                }
            }
        };
        walkDirectoryFiles(directoryFiles);
    }
    const result: string[] = [];
    for (let sourceFile of project.getSourceFiles()) {
        for (let exportSymbol of sourceFile.getExportSymbols()) {
            const name = exportSymbol.getName();
            result.push([sourceFile.getFilePath(), name].join('|'));
        }
    }
    return result;
}
