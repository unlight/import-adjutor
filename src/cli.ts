import getStdin from 'get-stdin';

import { exportsFromDirectory } from './exports-from-directory';
import { exportsNodeModules } from './exports-node-modules';
import { insertImport } from './insert-import';

const commands = [insertImport, exportsFromDirectory, exportsNodeModules];

const pushd = (directory: string, cwd = process.cwd()) => {
    process.chdir(directory);
    return () => {
        process.chdir(cwd);
    };
};

(async () => {
    const { command, args } = JSON.parse(await getStdin());
    if (!command) {
        throw new Error('Empty command');
    }
    const func = commands.find((cmd) => cmd.name === command);
    if (!func) {
        throw new Error(`Unknown command ${String(command)}`);
    }
    let popd: ReturnType<typeof pushd> | undefined;
    if (args && args.directory) {
        popd = pushd(args.directory);
    }
    const output = await func(args);
    if (popd) {
        popd();
    }
    process.stdout.write(JSON.stringify(output));
})().catch((error) => {
    process.stderr.write(error?.stack || String(error));
    process.exit(1);
});
