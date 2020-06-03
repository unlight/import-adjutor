import { exportsNodeModules } from './exports-node-modules';
import assert from 'assert';
import { Entry } from './entry';

describe('nodeModules', () => {
    let result: Entry[] = [];

    before(async () => {
        result = await exportsNodeModules({ directory: process.cwd() });
    });

    it('node modules should exists', () => {
        assert(result.length > 0);
    });

    it('fs module', () => {
        assert(result.find((entry) => entry.module == 'fs'));
    });

    it('buffer default name', () => {
        assert(result.find((entry) => entry.name == 'buffer' && entry.isDefault));
    });

    it('React default', () => {
        assert(
            result.find(
                (entry) => entry.name === 'React' && entry.module === 'react' && entry.isDefault,
            ),
        );
    });

    it('preact default', () => {
        assert(
            result.find(
                (entry) => entry.name === 'preact' && entry.module === 'preact' && entry.isDefault,
            ),
        );
    });

    it('type zoo', () => {
        assert(result.filter((entry) => entry.module === 'type-zoo').length > 0);
    });

    it('type zoo default should not exists', () => {
        assert(!result.find((entry) => entry.module === 'type-zoo' && entry.isDefault));
    });

    it('angualr material submodule', () => {
        assert(result.find((entry) => entry.module === '@angular/material/datepicker'));
    });

    it('angualr core testing submodule', () => {
        assert(result.find((entry) => entry.module === '@angular/core/testing'));
    });
});
