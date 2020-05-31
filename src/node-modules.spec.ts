import { nodeModules } from './node-modules';
describe('nodeModules', () => {
    it.only('ambientModules included', async () => {
        const result = await nodeModules({ directory: process.cwd() });
        console.log('result', result);
    });
});
