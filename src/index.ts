import { Project, SymbolFlags } from 'ts-morph';
import { inspect } from 'util';
import { ScriptTarget, ModuleKind, ModuleResolutionKind } from 'typescript';

const project = new Project({
    compilerOptions: {
        esModuleInterop: true,
    },
    // useInMemoryFileSystem: true,
});

export function getSources() {
    // project.
    // const exp = debug!.getExports().map((s) => s.getName());
    // console.log('exp', exp);
    // console.log('co', co);
    // project.addDirectoryAtPathIfExists('node_modules', { recursive: true });
    // project.addDirectoryAtPath('node_modules/@types/node', { recursive: true });
    // project.resolveSourceFileDependencies();
    // const s = project.createSourceFile('example.ts', '');
    // s.saveSync();
    project.createSourceFile('fixtures/component/tsconfig.json', '{}');
    project.addSourceFilesFromTsConfig('fixtures/component/tsconfig.json');
    // project.addDirectoryAtPathIfExists('node_modules', { recursive: true });
    const files = project.getSourceFiles('**').map((s) => s.getFilePath());
    console.log('files', files);
    const prog = project.getProgram();
    const tc = prog.getTypeChecker();
    const am = project.getAmbientModules().map((a) => a.getName());
    console.log('am', am);
    // const x = project.getAmbientModule('net');
    // console.log('x', x);
}
