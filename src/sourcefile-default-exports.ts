import { Node, SourceFile } from 'ts-morph';

/**
 * Get default export from `sourceFile`
 */
export function sourcefileDefaultExports(sourceFile: SourceFile) {
    let result: string | undefined;
    const exportAssignment = sourceFile.getExportAssignment(exportAssignment => {
        const expression = exportAssignment.getExpression();
        if (Node.isIdentifier(expression)) {
            result = String(expression.compilerNode.escapedText);
            return true;
        }
        return false;
    });
    return result;
}
