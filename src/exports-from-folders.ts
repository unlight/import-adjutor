import { FileSystemHost, Node, Project } from 'ts-morph';

import { extensions } from './constants';
import { createProject } from './create-project';
import { Entry } from './entry';
import { exportsFromDirectory } from './exports-from-directory';

type Arguments = {
    folders: string[];
    excludePatterns?: Record<
        string,
        { folderExcludePatterns: string[]; fileExcludePatterns: string[] }
    >;
};

export async function exportsFromFolders({ folders, excludePatterns }: Arguments) {
    let result: Entry[] = [];
    for await (let folder of folders) {
        const { folderExcludePatterns, fileExcludePatterns } = excludePatterns?.[folder] || {};
        result = result.concat(
            await exportsFromDirectory({
                directory: folder,
                folderExcludePatterns,
                fileExcludePatterns,
            }),
        );
    }
    return result;
}
