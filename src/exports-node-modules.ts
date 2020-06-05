import { Project, Symbol } from 'ts-morph';
import { createProject } from './create-project';
import { Entry } from './entry';
import { basename } from 'path';

type Arguments = {
    directory: string;
    project?: Project;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
};
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
    let nodeModules: string[] = project.getAmbientModules().map(getName); // eslint-disable-line unicorn/no-fn-reference-in-iterator
    if (await fs.fileExists(`${directory}/package.json`)) {
        const { dependencies, devDependencies } = JSON.parse(
            await fs.readFile(`${directory}/package.json`),
        );
        const nodeModulesExists = await fs.directoryExists(`${directory}/node_modules`);
        for (let name of Object.keys({ ...dependencies, ...devDependencies })) {
            if (name.startsWith('@types/')) {
                continue;
            }
            if (
                !(
                    nodeModulesExists &&
                    (await fs.directoryExists(`${directory}/node_modules/${name}`))
                )
            ) {
                continue;
            }
            const directories = fs.readDirSync(`${directory}/node_modules/${name}`);
            for (let directory of directories) {
                if (await fs.fileExists(`${directory}/package.json`)) {
                    const subname = `${name}/${basename(directory)}`;
                    nodeModules.push(subname);
                }
            }
        }
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
        // Try to get default name
        const defaultName = getName(symbol);
        if (!(defaultName.startsWith('/') || defaultName.includes(':'))) {
            result.push(new Entry({ name: getName(symbol), module: moduleName, isDefault: true }));
        }
        // Get other exports
        for (let exportSymbol of typeChecker.getExportsOfModule(symbol)) {
            const name = exportSymbol.getName();
            result.push(new Entry({ name, module: moduleName }));
        }
    }
    return result;
}

function getName(symbol: Symbol) {
    return symbol.getName().replace(/["']/g, '');
}
