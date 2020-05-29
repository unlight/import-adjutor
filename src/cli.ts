#!/usr/bin/env node
import meow from 'meow';
import { AnyFlags } from 'meow';
import { Project, SyntaxKind, Node } from 'ts-morph';
import fs from 'fs';

export async function main() {
    const project = new Project({
        compilerOptions: {
            esModuleInterop: true,
        },
        skipFileDependencyResolution: true,
        addFilesFromTsConfig: false,
    });

    const cli = meow({
        flags: {
            folder: {
                isRequired: true,
                isMultiple: true,
            },
        },
    });

    const folderFiles = await fs.promises.readdir((cli.flags.folder as string[])[0]);
    const tsconfig = folderFiles.find((file) => file === 'tsconfig.json');
    if (tsconfig) {
        project.addSourceFilesFromTsConfig(tsconfig);
    } else {
        project.addSourceFilesAtPaths([`${cli.flags.folder}/**`]);
    }
    project.getSourceFiles().forEach((sourceFile) => {
        const filepath = sourceFile.getFilePath();
        console.log('filepath', filepath);
        sourceFile.getExportedDeclarations().forEach((ed) => {});
        const ed2 = sourceFile.getExportSymbols().map((s) => {
            const name = s.getName();
            return name;
        });

        console.log(ed2);

        sourceFile.getExportAssignment((exportAssignment) => {
            var expr = exportAssignment.getExpression();
            if (Node.isIdentifier(expr)) {
                const name = expr.getSymbol()!.getName();
                console.log('name', name);
            }
            return true;
        });
    });
    const files = project.getSourceFiles().map((s) => s.getFilePath());
    console.log('files', files);
}

main();
