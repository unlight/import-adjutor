import * as library from '.';
import assert from 'assert';

it('smoke', () => {
    assert.ok(library);
});

it('hello test', () => {
    assert.equal(library.hello(), 'Hello world');
});
