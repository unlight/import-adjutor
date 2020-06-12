import globrex from 'globrex';
import { basename, relative , resolve } from 'path';
import picomatch from 'picomatch';
import { CompilerOptions, FileSystemHost, Project, ProjectOptions } from 'ts-morph';

import { defaultExcludeFolders, extensions } from './constants';

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
            root: directory,
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
    root,
    directoryFiles,
    project,
    fs = project.getFileSystem(),
    folderExcludePatterns,
    fileExcludePatterns,
    _folderExcludeMatcher = createFolderExcludeMatcher(folderExcludePatterns!),
    _fileExcludeMatcher = createFileMatcher(fileExcludePatterns),
}: {
    root: string;
    directoryFiles: string[];
    project: Project;
    fs: FileSystemHost;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
    _folderExcludeMatcher?: ReturnType<typeof createFolderExcludeMatcher>;
    _fileExcludeMatcher?: ReturnType<typeof createFileMatcher>;
}) {
    for (const file of directoryFiles) {
        if (extensions.find((extension) => file.endsWith(extension))) {
            if (_fileExcludeMatcher && _fileExcludeMatcher.some((matcher) => matcher(file))) {
                continue;
            }
            try {
                project.addSourceFileAtPath(file);
            } catch {} // eslint-disable-line no-empty
        } else if (await fs.directoryExists(file)) {
            if (
                _folderExcludeMatcher &&
                _folderExcludeMatcher.some(
                    (matcher) =>
                        matcher.ends(file) ||
                        matcher.regex.test(file) ||
                        matcher.contains.test(file) ||
                        matcher.base(file),
                )
            ) {
                continue;
            }

            let directoryFiles: string[] = [];
            try {
                directoryFiles = fs.readDirSync(file);
            } catch {} // eslint-disable-line no-empty

            await walkDirectoryFiles({
                root,
                directoryFiles,
                project,
                fs,
                folderExcludePatterns,
                fileExcludePatterns,
                _folderExcludeMatcher,
                _fileExcludeMatcher,
            });
        }
    }
}

function createFolderExcludeMatcher(patterns: string[]) {
    patterns = (patterns || []).concat(defaultExcludeFolders);
    patterns = [...new Set(patterns).values()];
    return patterns.map((pattern) => {
        const contains = `*/${pattern}/*`
            .replace('//', '/')
            .replace('/*/*', '/*')
            .replace('*/*/', '*/');
        return {
            regex: globrex(pattern).regex,
            contains: globrex(contains).regex,
            base: picomatch(pattern, { matchBase: true } as any),
            ends: (file: string) => file.endsWith(`/${pattern}`),
        };
    });
}

function createFileMatcher(patterns?: string[]) {
    if (patterns) {
        return patterns.map((pattern) => picomatch(pattern, { matchBase: true } as any));
    }
}
