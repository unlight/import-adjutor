import { Project, QuoteKind, ManipulationSettings } from 'ts-morph';
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
}: {
    declaration: Declaration;
    sourceFileContent: string;
    manipulationSettings?: Partial<ManipulationSettings>;
}) {
    const project = new Project({
        useInMemoryFileSystem: true,
        manipulationSettings: {
            quoteKind: QuoteKind.Single,
            ...manipulationSettings,
        },
    });
    const sourceFile = project.createSourceFile('0.ts', sourceFileContent, { overwrite: true });
    const importDeclaration = sourceFile.getImportDeclaration((importDeclaration) => {
        const literalValue = importDeclaration.getModuleSpecifier().getLiteralValue();
        return literalValue === declaration.specifier;
    });
    if (importDeclaration) {
        const importSpecifier = importDeclaration
            .getNamedImports()
            .find((importSpecifier) => importSpecifier.getName() === declaration.name);
        if (!importSpecifier) {
            declaration.isDefault
                ? importDeclaration.setDefaultImport(declaration.name)
                : importDeclaration.addNamedImport(declaration.name);
        }
    } else {
        sourceFile.addImportDeclaration({
            defaultImport: declaration.isDefault ? declaration.name : undefined,
            namedImports: declaration.isDefault ? [] : [declaration.name],
            moduleSpecifier: declaration.specifier,
        });
    }

    return sourceFile.getText();
}
