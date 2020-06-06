import assert from 'assert';

import { Entry } from './entry';
import { exportsFromFolders } from './exports-from-folders';

describe('exportsFromFolders', () => {
    it('exports from several folders', async () => {
        const result = await exportsFromFolders({
            folders: ['fixtures/folder', 'fixtures/subdirectory'],
        });
        const [_1, _2] = result;
        assert.strict.deepEqual(_1.name, 'IFile');
        assert.strict.deepEqual(_2.name, 'subdirectoryFile');
    });
});
