import assert from 'assert';
import { stripIndent, stripIndents } from 'common-tags';
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
        assert.equal(result, `import { rename } from 'fs';\n`);
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
        assert.equal(result, `import React from 'react';\n`);
    });

    it('named import to named', () => {
        const result = insertImport({
            sourceFileContent: `import { rename } from 'fs';\n`,
            declaration: {
                name: 'copy',
                specifier: 'fs',
            },
        });
        assert.equal(result, `import { rename, copy } from 'fs';\n`);
    });

    it('named import to default', () => {
        const result = insertImport({
            sourceFileContent: `import fs from 'fs';\n`,
            declaration: {
                name: 'sync',
                specifier: 'fs',
            },
        });
        assert.equal(result, `import fs, { sync } from 'fs';\n`);
    });

    it('duplicate should not be ignored', () => {
        const result = insertImport({
            sourceFileContent: `import { rename } from 'fs';\n`,
            declaration: {
                name: 'rename',
                specifier: 'fs',
            },
        });
        assert.equal(result, `import { rename } from 'fs';\n`);
    });

    it('multiple string import', () => {
        const result = insertImport({
            sourceFileContent: `import { copy,\nrename } from 'fs';\n`,
            declaration: {
                name: 'sync',
                specifier: 'fs',
            },
        });
        assert.equal(result, `import { copy,\nrename, sync } from 'fs';\n`);
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
        assert.equal(result, `#!/usr/bin/env node\nimport { a } from 'b';\nimport x from 'y';\n`);
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
        assert.equal(
            result,
            stripIndents`
            import { a } from 'b';
            import x from 'y';

            const c = 1;
        `,
        );
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
        assert.equal(result, `import { rename } from "fs";\n`);
    });

    it('findInsertIndex 1', () => {
        const index = findInsertIndex('n', ['a', 'z']);
        assert.equal(index, 1);
    });

    it('findInsertIndex 2', () => {
        const index = findInsertIndex('n', ['a', 'b', 'c']);
        assert.equal(index, 3);
    });

    it('findInsertIndex f', () => {
        const index = findInsertIndex('f', ['a', 'b', 'z']);
        assert.equal(index, 2);
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
        assert.equal(
            result,
            stripIndents`
            import { a, b, f } from 'z';
        `,
        );
    });
});
