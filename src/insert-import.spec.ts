import expect from 'expect';
import { stripIndents } from 'common-tags';
import { QuoteKind } from 'ts-morph';

import { findInsertIndex, insertImport } from './insert-import';

describe('insert import', () => {
    it('new import statement', () => {
        const result = insertImport({
            sourceFileContent: ``,
            declaration: {
                name: 'rename',
                specifier: 'fs',
            },
        });
        expect(result).toEqual(`import { rename } from 'fs';\n`);
    });

    it('new import as default', () => {
        const result = insertImport({
            sourceFileContent: ``,
            declaration: {
                name: 'React',
                isDefault: true,
                specifier: 'react',
            },
        });
        expect(result).toEqual(`import React from 'react';\n`);
    });

    it('named import to named', () => {
        const result = insertImport({
            sourceFileContent: `import { rename } from 'fs';\n`,
            declaration: {
                name: 'copy',
                specifier: 'fs',
            },
        });
        expect(result).toEqual(`import { rename, copy } from 'fs';\n`);
    });

    it('named import to default', () => {
        const result = insertImport({
            sourceFileContent: `import fs from 'fs';\n`,
            declaration: {
                name: 'sync',
                specifier: 'fs',
            },
        });
        expect(result).toEqual(`import fs, { sync } from 'fs';\n`);
    });

    it('duplicate should not be ignored', () => {
        const result = insertImport({
            sourceFileContent: `import { rename } from 'fs';\n`,
            declaration: {
                name: 'rename',
                specifier: 'fs',
            },
        });
        expect(result).toEqual(`import { rename } from 'fs';\n`);
    });

    it('multiple string import', () => {
        const result = insertImport({
            sourceFileContent: `import { copy,\nrename } from 'fs';\n`,
            declaration: {
                name: 'sync',
                specifier: 'fs',
            },
        });
        expect(result).toEqual(`import { copy,\nrename, sync } from 'fs';\n`);
    });

    it('shebang should be kept', () => {
        const result = insertImport({
            sourceFileContent: stripIndents`
            #!/usr/bin/env node
            import { a } from 'b';
            `,
            declaration: {
                isDefault: true,
                name: 'x',
                specifier: 'y',
            },
        });
        expect(result).toEqual(
            `#!/usr/bin/env node\nimport { a } from 'b';\nimport x from 'y';\n`,
        );
    });

    it('content after imports should be kept', () => {
        const result = insertImport({
            sourceFileContent: stripIndents`
            import { a } from 'b';

            const c = 1;
            `,
            declaration: {
                isDefault: true,
                name: 'x',
                specifier: 'y',
            },
        });
        expect(result).toEqual(stripIndents`
            import { a } from 'b';
            import x from 'y';

            const c = 1;
        `);
    });

    it('manipulationSettings quoteKind', () => {
        const result = insertImport({
            sourceFileContent: ``,
            declaration: {
                name: 'rename',
                specifier: 'fs',
            },
            manipulationSettings: { quoteKind: QuoteKind.Double } as any,
        });
        expect(result).toEqual(`import { rename } from "fs";\n`);
    });

    it('findInsertIndex 1', () => {
        const index = findInsertIndex('n', ['a', 'z']);
        expect(index).toEqual(1);
    });

    it('findInsertIndex 2', () => {
        const index = findInsertIndex('n', ['a', 'b', 'c']);
        expect(index).toEqual(3);
    });

    it('findInsertIndex f', () => {
        const index = findInsertIndex('f', ['a', 'b', 'z']);
        expect(index).toEqual(2);
    });

    it('sorted insert import', () => {
        const result = insertImport({
            sorted: true,
            sourceFileContent: stripIndents`
            import { a, f } from 'z';
            `,
            declaration: {
                name: 'b',
                specifier: 'z',
            },
        });
        expect(result).toEqual(
            stripIndents`
            import { a, b, f } from 'z';
        `,
        );
    });

    it('new import without semicolon', () => {
        const result = insertImport({
            sourceFileContent: ``,
            declaration: {
                name: 'rename',
                specifier: 'fs',
            },
            manipulationSettings: {
                noSemicolon: true,
            },
        });
        expect(result).toEqual(`import { rename } from 'fs'\n`);
    });

    it('exists import without semicolon', () => {
        const result = insertImport({
            sourceFileContent: `import { rename } from 'fs';\n`,
            declaration: {
                name: 'sync',
                specifier: 'fs',
            },
            manipulationSettings: {
                noSemicolon: true,
            },
        });
        expect(result).toEqual(`import { rename, sync } from 'fs'\n`);
    });

    it('no space before brace', () => {
        const result = insertImport({
            sourceFileContent: ``,
            declaration: {
                name: 'sync',
                specifier: 'fs',
            },
            manipulationSettings: {
                insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false,
            },
        });
        expect(result).toEqual(`import {sync} from 'fs';\n`);
    });
});
