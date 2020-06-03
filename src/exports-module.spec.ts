import { createProject } from './create-project';
import { exportsModule } from './exports-module';

describe('exportsModule', () => {
    it('exportsModule', async () => {
        const project = await createProject({ directory: process.cwd() });
        const result = await exportsModule({ name: 'react', project });
        // console.log(
        //     'result',
        //     result.filter((entry) => entry.module === 'type-zoo'),
        // );
    });
});
