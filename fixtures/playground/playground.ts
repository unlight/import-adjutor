import { Project, SymbolFlags } from 'ts-morph';
import { inspect } from 'util';
import { ScriptTarget, ModuleKind, ModuleResolutionKind } from 'typescript';

const project = new Project({
    compilerOptions: {
        esModuleInterop: true,
    },
    skipFileDependencyResolution: true,
    addFilesFromTsConfig: false,
    // useInMemoryFileSystem: true,
});

const program = project.getProgram();
const typeChecker = program.getTypeChecker();

const sourceFile = project.createSourceFile('0.ts', `import fs from 'fs'`);
const importDeclarations = sourceFile.getImportDeclarations();
for (let importDeclaration of importDeclarations) {
    const moduleName = importDeclaration.getModuleSpecifierValue();
    let symbol = importDeclaration.getImportClause()!.getSymbol()!;
    symbol = typeChecker.getAliasedSymbol(symbol)!;
    for (let exportSymbol of typeChecker.getExportsOfModule(symbol)) {
        const name = exportSymbol.getName();
        console.log('name', name);
    }
}
