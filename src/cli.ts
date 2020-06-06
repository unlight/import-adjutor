import getStdin from 'get-stdin';

import { exportsFromDirectory } from './exports-from-directory';
import { exportsFromFolders } from './exports-from-folders';
import { exportsNodeModules } from './exports-node-modules';
import { insertImport } from './insert-import';

const commands = [insertImport, exportsFromDirectory, exportsNodeModules, exportsFromFolders];

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
})().catch((error) => {
    process.stderr.write(error?.stack || String(error));
    process.exit(1);
});
