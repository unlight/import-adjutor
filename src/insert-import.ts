import { ManipulationSettings, Project, QuoteKind, ScriptKind } from 'ts-morph';

import { Entry } from './entry';

type Declaration = {
    name: string;
    specifier: string;
    isDefault?: boolean;
};

export function insertImport({
    declaration,
    sourceFileContent,
    manipulationSettings,
    sorted = false,
}: {
    declaration: Declaration;
    sourceFileContent: string;
    manipulationSettings?: Partial<ManipulationSettings>;
    sorted?: boolean;
}) {
    const project = new Project({
        useInMemoryFileSystem: true,
        manipulationSettings: {
            quoteKind: QuoteKind.Single,
            ...manipulationSettings,
        },
    });
    const sourceFile = project.createSourceFile('0.ts', sourceFileContent, {
        overwrite: true,
    });
    const importDeclaration = sourceFile.getImportDeclaration((importDeclaration) => {
        const literalValue = importDeclaration.getModuleSpecifier().getLiteralValue();
        return literalValue === declaration.specifier;
    });
    if (importDeclaration) {
        const namedImports = importDeclaration.getNamedImports().map((x) => x.getName());
        if (!namedImports.some((name) => name === declaration.name)) {
            if (declaration.isDefault) {
                importDeclaration.setDefaultImport(declaration.name);
            } else if (sorted) {
                const index = findInsertIndex(declaration.name, namedImports);
                importDeclaration.insertNamedImport(index, declaration.name);
            } else {
                importDeclaration.addNamedImport(declaration.name);
            }
        }
    } else {
        sourceFile.addImportDeclaration({
            defaultImport: declaration.isDefault ? declaration.name : undefined,
            namedImports: declaration.isDefault ? [] : [declaration.name],
            moduleSpecifier: declaration.specifier,
        });
    }

    return sourceFile.getFullText();
}

/**
 * Find index for {name} to insert to keep array sorted.
 * @param name
 * @param array Sorted array
 */
export function findInsertIndex(name: string, array: string[]) {
    let result = 0;
    for (let value of array) {
        if (value > name) {
            break;
        }
        result++;
    }
    return result;
}
