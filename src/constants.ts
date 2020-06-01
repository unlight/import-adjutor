import resolve from 'resolve';

export const extensions = ['.ts', '.ts', '.js', '.tsx', '.jsx', '.mjs'];

export const resolveOptions: resolve.AsyncOpts = {
    extensions: [...extensions, '.d.ts'],
    packageFilter: (pk: any) => {
        if (pk.typings) {
            pk.main = pk.typings;
        } else if (pk.types) {
            pk.main = pk.types;
        } else if (pk.module) {
            pk.main = pk.module;
        }
        return pk;
    },
    basedir: undefined,
};
