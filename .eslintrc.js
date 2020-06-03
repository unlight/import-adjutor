module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:unicorn/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: false,
        },
        project: 'tsconfig.json',
        warnOnUnsupportedTypeScriptVersion: false,
    },
    plugins: ['unicorn', 'import', 'only-warn'],
    rules: {
        'no-undef': 0,
        'no-unused-vars': 0,
        indent: 0,
        'no-dupe-class-members': 0,
        'unicorn/import-index': 0,
        'unicorn/catch-error-name': 0,
        'unicorn/prevent-abbreviations': 1,
        'unicorn/prefer-includes': 1,
        'import/newline-after-import': 0,
        'import/no-duplicates': 1,
        'import/max-dependencies': [1, { max: 10 }],
        quotes: [1, 'single', { allowTemplateLiterals: true }],
        semi: [1, 'always'],
    },
};
