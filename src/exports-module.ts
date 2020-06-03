import { Project } from 'ts-morph';
import { createProject } from './create-project';
import { Entry } from './entry';

type Arguments = {
    project: Project;
    name: string;
};
export async function exportsModule({ name, project }: Arguments) {
    const program = project.getProgram();
    const typeChecker = program.getTypeChecker();
    const result: Entry[] = [];
    const sourceFile = project.createSourceFile('0.ts', `import __ from '${name}'`);
    const importDeclarations = sourceFile.getImportDeclarations();
    for (let importDeclaration of importDeclarations) {
        const moduleName = importDeclaration.getModuleSpecifierValue();
        let symbol = importDeclaration.getImportClause()!.getSymbol()!;
        symbol = typeChecker.getAliasedSymbol(symbol)!;
        result.push(new Entry({ name: symbol.getName(), module: moduleName, isDefault: true }));
        for (let exportSymbol of typeChecker.getExportsOfModule(symbol)) {
            const name = exportSymbol.getName();
            result.push(new Entry({ name, module: moduleName }));
        }
    }
    return result;
}
