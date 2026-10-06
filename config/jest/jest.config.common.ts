import type { Config } from 'jest';

export function generateJestConfig(isaacSite: string): Config {
    return {
        collectCoverageFrom: [
            "src/**/*.{js,jsx,ts,tsx}",
            "!src/**/*.d.ts"
        ],
        globalSetup: "<rootDir>/src/test/globalSetup.ts",
        setupFiles: [
            "<rootDir>/config/jest/jest.polyfills.ts"
        ],
        setupFilesAfterEnv: [
            "<rootDir>src/test/setupTests.ts",
            "react-app-polyfill/jsdom"
        ],
        rootDir: "../../",
        testMatch: [
            "<rootDir>src/**/*.test.(js|jsx|ts|tsx)"
        ],
        testEnvironment: "jest-fixed-jsdom",
        testEnvironmentOptions: {
            "url": "http://localhost",
            customExportConditions: [''],
        },
        transform: {
            "^.+\\.css$": "<rootDir>config/jest/cssTransform.ts",
            "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>config/jest/fileTransform.ts",
            "^.+\\.[jt]sx?$": ["ts-jest", {
                tsconfig: "<rootDir>/tsconfig.json",
            }],
        },
        transformIgnorePatterns: [
            "/node_modules/(?!@popperjs|leaflet|query-string|decode-uri-component|filter-obj|split-on-first)",
            "^.+\\.module\\.(css|sass|scss)$"
        ],
        moduleNameMapper: {
            "^react-native$": "react-native-web",
            "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
            "uuid": "uuid"
        },
        moduleFileExtensions: [
            "web.js",
            "js",
            "web.ts",
            "ts",
            "web.tsx",
            "tsx",
            "json",
            "web.jsx",
            "jsx",
            "node"
        ],
        watchPlugins: [
            "<rootDir>node_modules/jest-watch-typeahead/filename.js",
            "<rootDir>node_modules/jest-watch-typeahead/testname.js"
        ],
        workerIdleMemoryLimit: '512MB',
        testTimeout: 20000,
        globals: {
            REACT_APP_API_VERSION: "any",
            EDITOR_PREVIEW: false,
            ISAAC_SITE: isaacSite
        },
    };
};
