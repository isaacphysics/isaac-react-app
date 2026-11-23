import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint, { parser as tsParser } from "typescript-eslint";
import pluginReact from "@eslint-react/eslint-plugin";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y-x";
import { fixupPluginRules } from "@eslint/compat";
import stylistic from '@stylistic/eslint-plugin'


export default [
    {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
    {languageOptions: { globals: globals.browser }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.recommended,
    pluginJsxA11y.configs.strict,
    {
        plugins: {
            "react-hooks": fixupPluginRules(pluginReactHooks),
            '@stylistic': stylistic
        },
        rules: {
            "no-prototype-builtins": "off",
            "prefer-const": "error",
            "semi": "error",
            "@stylistic/indent": ["error", 4, {"SwitchCase": 1}],
            "jsx-a11y-x/no-static-element-interactions": "error",
            // TODO: The following eslint-react rules were not in eslint-plugin-react and have many violations
            // throughout the code. These violations should be addressed and the rules enabled
            "@eslint-react/dom-no-dangerously-set-innerhtml": "off",
            "@eslint-react/naming-convention-ref-name": "off",
            "@eslint-react/no-array-index-key": "off",
            "@eslint-react/no-nested-component-definitions": "off",
            "@eslint-react/purity": "off",
            "@eslint-react/set-state-in-effect": "off",
            "@eslint-react/static-components": "off",
            "@eslint-react/use-state": "off",
            "react-hooks/rules-of-hooks": "error",
            "@eslint-react/exhaustive-deps": "error",
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-floating-promises": "error",
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    "jsx": true
                },
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        }
    }
];
