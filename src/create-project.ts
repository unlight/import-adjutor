import micromatch from 'micromatch';
import { CompilerOptions, FileSystemHost,Project, ProjectOptions } from 'ts-morph';

import { extensions } from './constants';

export async function createProject({
    directory,
    folderExcludePatterns,
    fileExcludePatterns,
    projectOptions,
    compilerOptions,
}: {
    directory: string;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
    projectOptions?: ProjectOptions;
    compilerOptions?: CompilerOptions;
}) {
    const project = new Project({
        compilerOptions: {
            esModuleInterop: true,
            allowJs: true,
            ...compilerOptions,
        },
        skipFileDependencyResolution: true,
        addFilesFromTsConfig: false,
        ...projectOptions,
    });
    const fs = project.getFileSystem();
    const directoryFiles = fs.readDirSync(directory);
    const config = directoryFiles.find((file) => {
        return file.endsWith('/tsconfig.json') || file.endsWith('/jsconfig.json');
    });
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
    return project;
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
    for (const file of directoryFiles) {
        if (extensions.find((extension) => file.endsWith(extension))) {
            if (
                fileExcludePatterns &&
                micromatch.isMatch(file, fileExcludePatterns, { matchBase: true })
            ) {
                continue;
            }
            project.addSourceFileAtPath(file);
        } else if (await fs.directoryExists(file)) {
            if (
                folderExcludePatterns &&
                micromatch.isMatch(file, folderExcludePatterns, { contains: true })
            ) {
                continue;
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
