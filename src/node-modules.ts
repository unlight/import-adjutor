import { Project } from 'ts-morph';
import { createProject } from './create-project';

type Arguments = {
    directory: string;
    project?: Project;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
};

export async function nodeModules({
    directory,
    project,
    folderExcludePatterns,
    fileExcludePatterns,
}: Arguments) {
    project =
        project ?? (await createProject({ directory, folderExcludePatterns, fileExcludePatterns }));
    const program = project.getProgram();
    const typeChecker = program.getTypeChecker();
    console.log('typeChecker', typeChecker);
    const ambientModules = project.getAmbientModules().map((x) => x.getName());
    console.log('ambientModules', ambientModules);
}
