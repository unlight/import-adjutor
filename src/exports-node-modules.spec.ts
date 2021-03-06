import assert from 'assert';

import { createProject } from './create-project';
import { Entry } from './entry';
import { exportsNodeModules } from './exports-node-modules';

describe('nodeModules', () => {
    let result: Entry[] = [];

    describe('real directory', () => {
        before(async () => {
            result = await exportsNodeModules({ directory: `${__dirname}/..` });
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

        it('resolve from path', () => {
            assert(result.find((entry) => entry.module === 'path' && entry.name === 'resolve'));
        });

        it('no duplicates', () => {
            const count1 = result.length;
            const count2 = new Set(result.map((entry) => entry.id())).size;
            assert.equal(count1, count2);
        });

        it('find duplicate', () => {
            const count = new Map<string, number>();
            for (const entry of result) {
                const id = entry.id();
                let value = count.get(id);
                if (!value) {
                    value = 0;
                }
                value++;
                count.set(id, value);
            }
            for (const [id, number] of count.entries()) {
                if (number > 1) {
                    assert.fail(`Found duplicate ${id}`);
                }
            }
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
