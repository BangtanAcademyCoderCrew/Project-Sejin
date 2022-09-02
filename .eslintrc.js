module.exports = {
    root: true,
    overrides: [
        {
            // JavaScript
            files: ['*.{js}'],
            parserOptions: {
                sourceType: 'module'
            },
            extends: ['airbnb', 'airbnb/hooks', 'prettier'],
            plugins: ['prettier'],
            settings: {
                'import/resolver': {
                    node: {
                        extensions: ['.js', '.ts']
                    }
                }
            },
            rules: {
                'max-len': [
                    'error',
                    {
                        code: 120,
                        ignoreRegExpLiterals: true,
                        ignoreTemplateLiterals: true,
                        ignoreUrls: true
                    }
                ],
                'global-require': 'off',
                'import/extensions': [
                    'error',
                    'ignorePackages',
                    {
                        js: 'never',
                        ts: 'never',
                    }
                ],
                'import/prefer-default-export': 'off',
                'import/no-cycle': 'warn',
                'lines-between-class-members': 'off',
                'no-console': 'off',
                'no-param-reassign': ['error', { props: false }],
                'no-plusplus': ['warn', { allowForLoopAfterthoughts: true }],
                'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
                'no-shadow': 'off',
                'prefer-destructuring': ['warn', { object: true, array: false }]
            }
        },
        {
            // Typescript
            files: ['*.{ts}'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'airbnb-typescript-prettier',
                'prettier/@typescript-eslint'
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json'
            },
            plugins: ['@typescript-eslint'],
            settings: {
                'import/resolver': {
                    node: {
                        extensions: ['.ts', '.js']
                    }
                }
            },
            rules: {
                'import/prefer-default-export': 'off',
                'import/no-cycle': 'warn',
                'prefer-destructuring': ['warn', { object: true, array: false }],
                '@typescript-eslint/lines-between-class-members': ['error'],
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-for-in-array': 'warn',
                '@typescript-eslint/no-shadow': ['error'],
                'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement']
            }
        }
    ],
};
