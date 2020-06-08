import assert from 'assert';

import { Entry } from './entry';
import { exportsNodeModules } from './exports-node-modules';

describe('nodeModules', () => {
    let result: Entry[] = [];

    describe('real directory', () => {
        before(async () => {
            result = await exportsNodeModules({ directory: process.cwd() });
        });

        it('node modules should exists', () => {
            assert(result.length > 0);
        });

        it('fs module', () => {
            assert(result.find((entry) => entry.module == 'fs'));
        });

        it('React default', () => {
            assert(
                result.find(
                    (entry) =>
                        entry.name === 'React' && entry.module === 'react' && entry.isDefault,
                ),
            );
        });

        it('preact default', () => {
            assert(
                result.find(
                    (entry) =>
                        entry.name === 'preact' && entry.module === 'preact' && entry.isDefault,
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

        describe('unknown default should not be in result', () => {
            it('match', () => {
                assert.deepEqual(
                    result.filter(
                        (entry) => entry.module === 'picomatch' && entry.name === 'unknown',
                    ),
                    [],
                );
            });

            it('every default', () => {
                assert.deepEqual(
                    result.filter((entry) => entry.name === 'unknown' && entry.isDefault),
                    [],
                );
            });
        });
    });
});
