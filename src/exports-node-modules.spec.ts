import expect from 'expect';

import { Entry } from './entry';
import { exportsNodeModules } from './exports-node-modules';

describe('nodeModules', () => {
    let result: Entry[] = [];

    describe('real directory', () => {
        before(async () => {
            result = await exportsNodeModules({ directory: `${__dirname}/..` });
        });

        it('node modules should exists', () => {
            expect(result.length).toBeGreaterThan(0);
        });

        it('fs module', () => {
            expect(result.find(entry => entry.module == 'fs')).toBeTruthy();
        });

        it('React default', () => {
            expect(
                result.find(
                    entry =>
                        entry.name === 'React' &&
                        entry.module === 'react' &&
                        entry.isDefault,
                ),
            ).toBeTruthy();
        });

        it('type zoo', () => {
            expect(result.some(entry => entry.module === 'type-zoo')).toBeTruthy();
        });

        it('type zoo default should not exists', () => {
            expect(
                !result.some(entry => entry.module === 'type-zoo' && entry.isDefault),
            ).toBeTruthy();
        });

        it('angualr material submodule', () => {
            expect(
                result.find(entry => entry.module === '@angular/material/datepicker'),
            ).toBeTruthy();
        });

        it('angualr core testing submodule', () => {
            expect(
                result.find(entry => entry.module === '@angular/core/testing'),
            ).toBeTruthy();
        });

        it('resolve from path', () => {
            expect(
                result.find(
                    entry => entry.module === 'path' && entry.name === 'resolve',
                ),
            ).toBeTruthy();
        });

        it('no duplicates', () => {
            const count1 = result.length;
            const count2 = new Set(result.map(entry => entry.id())).size;
            expect(count1).toEqual(count2);
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
                    throw new Error(`Found duplicate ${id}`);
                }
            }
        });

        describe('unknown default should not be in result', () => {
            it('match', () => {
                expect(
                    result.filter(
                        entry =>
                            entry.module === 'picomatch' && entry.name === 'unknown',
                    ),
                ).toEqual([]);
            });

            it('every default', () => {
                expect(
                    result.filter(entry => entry.name === 'unknown' && entry.isDefault),
                ).toEqual([]);
            });
        });
    });
});
