#!/usr/bin/env node
import getStdin from 'get-stdin';
import { insertImport } from './insert-import';

const commands = [insertImport];

(async () => {
    const { command, args } = JSON.parse(await getStdin());
    const func = commands.find((cmd) => cmd.name === command);
    if (!func) {
        throw new Error('Unknown command');
    }
    const output = await func(args);
    process.stdout.write(JSON.stringify(output));
})().catch((err) => {
    process.stderr.write(String(err));
});
