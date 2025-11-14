module.exports = {
    "collectCoverageFrom": [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts"
    ],
    "resolver": "jest-pnp-resolver",
    globalSetup: "<rootDir>/src/test/globalSetup.ts",
    setupFiles: [
        "<rootDir>/config/jest/jest.polyfills.js"
    ],
    "setupFilesAfterEnv": [
        "<rootDir>src/test/setupTests.ts",
        "react-app-polyfill/jsdom"
    ],
    "rootDir": "../../",
    "testMatch": [
        "<rootDir>src/**/*.test.(js|jsx|ts|tsx)"
    ],
    "testEnvironment": "jest-fixed-jsdom",
    "testEnvironmentOptions": {
        "url": "http://localhost",
        customExportConditions: [''],
    },
    "transform": {
        "^.+\\.css$": "<rootDir>config/jest/cssTransform.js",
        "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>config/jest/fileTransform.js",
        "^.+\\.[jt]sx?$": ["ts-jest", {
            tsconfig: "<rootDir>/tsconfig.json",
        }],

    },
    "transformIgnorePatterns": [
        "/node_modules/(?!@popperjs|katex|leaflet)",
        "^.+\\.module\\.(css|sass|scss)$"
    ],
    "moduleNameMapper": {
        "^react-native$": "react-native-web",
        "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
        "uuid": "uuid"
    },
    "moduleFileExtensions": [
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
    "watchPlugins": [
        "<rootDir>node_modules/jest-watch-typeahead/filename.js",
        "<rootDir>node_modules/jest-watch-typeahead/testname.js"
    ],
    "globals": {
        REACT_APP_API_VERSION: "any",
    },
    "workerIdleMemoryLimit": '512MB',
    "testTimeout": 20000
};
