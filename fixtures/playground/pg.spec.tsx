import { spawn } from 'child_process';

describe('index', () => {
    it.skip('send stdin', async () => {
        const proc = spawn('node', ['src/~playground/test-stdin.js'], { cwd: process.cwd() });
        proc.stdout.on('readable', (x) => {
            const data = proc.stdout.read();
            console.log('data', data && data.toString());
        });
        proc.stdin.end('hi');
    });
});
