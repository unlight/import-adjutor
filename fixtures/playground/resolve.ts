import resolve from 'resolve';
import { resolveOptions } from '../constants';
import { promisify } from 'util';

// resolve('@types/pkg-dir', resolveOptions, (err, res) => {
//     console.log('err', err);
//     console.log('res', res);
// });

// resolve('@types/micromatch', resolveOptions, (err, res) => {
//     console.log('err', err);
//     console.log('res', res);
// });

const presolve: (s: string, o: resolve.AsyncOpts) => Promise<any> = promisify(resolve);

(async () => {
    let resul = await presolve('@types/micromatch', resolveOptions);
    resul = await presolve('@types/pkg-dir', resolveOptions);
    console.log('resul', resul);
})();
