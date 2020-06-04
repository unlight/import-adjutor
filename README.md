# import-adjutor

Parse ecmascript modules and collect names of export vars, functions, etc.  
Ex- [esm-exports](https://github.com/unlight/esm-exports)

## Usage

```sh
echo json | import-adjutor
```

Where `json` is:

```js
{
    command: string;
    args: object;
}
```

## API

#### insertImport

```
command: 'insertImport';
args:
    declaration: Declaration;
    sourceFileContent: string;
    manipulationSettings?: Partial<ManipulationSettings>;
type Declaration = {
    name: string;
    specifier: string;
    isDefault?: boolean;
};
interface ManipulationSettings extends SupportedFormatCodeSettingsOnly {
    /** Indentation text */
    indentationText: IndentationText;
    /** New line kind */
    newLineKind: NewLineKind;
    /** Quote type used for string literals. */
    quoteKind: QuoteKind;
    /**
     * Whether to enable renaming shorthand property assignments, binding elements,
     * and import & export specifiers without changing behaviour.
     * @remarks Defaults to true.
     * This setting is only available when using TypeScript 3.4+.
     */
    usePrefixAndSuffixTextForRename: boolean;
    /** Whether to use trailing commas when inserting or removing nodes. */
    useTrailingCommas: boolean;
}
```

#### exportsNodeModules

```
command: 'exportsNodeModules';
args:
    directory: string;
    project?: Project;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
```

#### exportsFromDirectory

```
command: 'exportsFromDirectory';
args:
    directory: string;
    project?: Project;
    folderExcludePatterns?: string[];
    fileExcludePatterns?: string[];
```

## Resources

-   https://ts-ast-viewer.com/
-   https://stackoverflow.com/questions/56999775/how-to-get-exported-members-using-typescript-compiler-api
-   https://github.com/GooGee/Code-Builder/blob/master/src/renderer/model/Checker.ts
-   https://stackoverflow.com/questions/58885433/typescript-compiler-how-to-get-an-exported-symbol-by-name

## Todo
