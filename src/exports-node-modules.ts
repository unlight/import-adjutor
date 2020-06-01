import { Project } from 'ts-morph';
import { createProject } from './create-project';
import { Entry } from './entry';

type Arguments = {
    directory: string;
    project?: Project;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
};
/**
 * Get all
 * @param {Arguments} {    directory,    project,    folderExcludePatterns,    fileExcludePatterns,} [description]
 */
export async function exportsNodeModules({
    directory,
    project,
    folderExcludePatterns,
    fileExcludePatterns,
}: Arguments) {
    project =
        project ?? (await createProject({ directory, folderExcludePatterns, fileExcludePatterns }));
    const program = project.getProgram();
    const typeChecker = program.getTypeChecker();
    const result: Entry[] = [];
    const fs = project.getFileSystem();

    let nodeModules: string[] = project
        .getAmbientModules()
        .map((s) => s.getName().replace(/["']/g, ''));

    if (await fs.fileExists(`${directory}/package.json`)) {
        const { dependencies, devDependencies } = JSON.parse(
            await fs.readFile(`${directory}/package.json`),
        );
        nodeModules = nodeModules.concat(
            Object.keys({ ...dependencies, ...devDependencies }).filter(
                (name) => !name.startsWith('@types/'),
            ),
        );
    }
    const sourceFileContent = nodeModules
        .map((name, index) => `import _${index} from '${name}'`)
        .join('\n');
    const sourceFile = project.createSourceFile('0.ts', sourceFileContent);
    const importDeclarations = sourceFile.getImportDeclarations();
    for (let importDeclaration of importDeclarations) {
        const moduleName = importDeclaration.getModuleSpecifierValue();
        let symbol = importDeclaration.getImportClause()!.getSymbol()!;
        symbol = typeChecker.getAliasedSymbol(symbol)!;
        for (let exportSymbol of typeChecker.getExportsOfModule(symbol)) {
            const name = exportSymbol.getName();
            result.push(new Entry({ name, module: moduleName }));
        }
    }
    return result;
}
