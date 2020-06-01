import { exportsNodeModules } from './exports-node-modules';
import assert from 'assert';

describe('nodeModules', () => {
    it('node modules', async () => {
        const result = await exportsNodeModules({ directory: process.cwd() });
        assert(result.length > 0, 'node modules should exists');
        assert(
            result.find((entry) => entry.module == 'fs'),
            'fs module',
        );
    });
});
