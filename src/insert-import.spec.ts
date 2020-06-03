import assert from 'assert';
import { insertImport } from './insert-import';

describe.only('insert import', () => {
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

    // it.only('multiple string import', () => {
    //     const result = insertImport({
    //         sourceFileContent: `import {copy,\njoin,\nkill} from 'fs';\n`,
    //         declaration: {
    //             name: 'copy',
    //             specifier: 'fs',
    //         },
    //     });
    //     assert.equal(result, `import fs, { sync } from 'fs';\n`);
    // });
});
