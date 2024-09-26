import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint, { parser as tsParser } from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import { fixupPluginRules } from "@eslint/compat";


export default [
    {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
    {languageOptions: { globals: globals.browser }},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginJsxA11y.flatConfigs.strict,
    {
        plugins: {
            "react-hooks": fixupPluginRules(pluginReactHooks),
        },
        settings: {
            react: {
                version: "detect"
            }
        },
        rules: {
            "no-prototype-builtins": "off",
            "prefer-const": "warn",
            "semi": "warn",
            "indent": ["warn", 4, {"SwitchCase": 1}],
            "jsx-a11y/no-static-element-interactions": "warn",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_"
            }],
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-empty-interface": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "react/jsx-no-target-blank": "off", // https://github.com/isaacphysics/isaac-react-app/pull/1134#discussion_r1774839755
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    "jsx": true
                }
            }
        }
    }
];
