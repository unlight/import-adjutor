import { basename } from 'path';
import { Project, Symbol } from 'ts-morph';

import { createProject } from './create-project';
import { Entry } from './entry';
import { sourcefileDefaultExports } from './sourcefile-default-exports';

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
}: Arguments): Promise<Entry[]> {
    project =
        project ??
        (await createProject({
            directory,
            folderExcludePatterns,
            fileExcludePatterns,
        }));
    const program = project.getProgram();
    const typeChecker = program.getTypeChecker();
    const entries = new Map<string, Entry>();
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
                name => !name.startsWith('@types/'),
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
        // Get imports from default
        const defaultImport = importDeclaration.getDefaultImport();
        if (defaultImport) {
            const defaultImportType = defaultImport.getType();
            for (const property of defaultImportType.getProperties()) {
                const entry = new Entry({
                    name: property.getName(),
                    module: moduleName,
                });
                entries.set(entry.id(), entry);
            }
        }
        // Try to get default name
        const sourceFile = importDeclaration.getModuleSpecifierSourceFile();
        if (sourceFile) {
            const name = sourcefileDefaultExports(sourceFile);
            if (name) {
                const entry = new Entry({ name, module: moduleName, isDefault: true });
                entries.set(entry.id(), entry);
            }
        }
        // Get other exports
        let symbol = importDeclaration.getImportClause()!.getSymbol()!;
        symbol = typeChecker.getAliasedSymbol(symbol)!;
        for (let exportSymbol of typeChecker.getExportsOfModule(symbol)) {
            const name = exportSymbol.getName();
            const entry = new Entry({ name, module: moduleName });
            entries.set(entry.id(), entry);
        }
    }
    return [...entries.values()];
}

function getName(symbol: Symbol) {
    return symbol.getName().replace(/["']/g, '');
}
