#!/usr/bin/env node
import getStdin from 'get-stdin';
import { insertImport } from './insert-import';
import { exportsFromDirectory } from './exports-from-directory';
import { exportsNodeModules } from './exports-node-modules';

const commands = [insertImport, exportsFromDirectory, exportsNodeModules];

(async () => {
    const { command, args } = JSON.parse(await getStdin());
    if (!command) {
        throw new Error('Empty command');
    }
    const func = commands.find((cmd) => cmd.name === command);
    if (!func) {
        throw new Error(`Unknown command ${String(command)}`);
    }
    const output = await func(args);
    process.stdout.write(JSON.stringify(output));
})().catch((err) => {
    process.stderr.write(String(err));
    process.exit(1);
});
