import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
            ecmaVersion: 2020,
        },
        plugins: {
            react: pluginReact,
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
        settings: { react: { version: 'detect' } },
    },
    {
        ignores: ['vendor/**', 'node_modules/**', 'public/build/**', 'bootstrap/**', 'storage/**', 'tests/**'],
    },
);
