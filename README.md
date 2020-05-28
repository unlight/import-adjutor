# import-adjutor

Parse ecmascript modules and collect names of export vars, functions, etc.  
Ex- [esm-exports](https://github.com/unlight/esm-exports)

## Dev notes

-   new name `import-adjutor`
-   new concept use https://github.com/dsherret/ts-morph
-   having cli / api to manipulate import string
-   collect all modules as string 'module|name'
-   still need to collect default imports `export = React` by resolving and reading files

## Resources

-   https://stackoverflow.com/questions/56999775/how-to-get-exported-members-using-typescript-compiler-api
-   https://github.com/GooGee/Code-Builder/blob/master/src/renderer/model/Checker.ts
-   https://stackoverflow.com/questions/58885433/typescript-compiler-how-to-get-an-exported-symbol-by-name
