module.exports = {
    "collectCoverageFrom": [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts"
    ],
    "resolver": "jest-pnp-resolver",
    "setupFilesAfterEnv": [
        "@testing-library/jest-dom/extend-expect",
        "<rootDir>src/test/setupTests.ts",
        "react-app-polyfill/jsdom"
    ],
    "rootDir": "../../",
    "testMatch": [
        "<rootDir>src/**/*.test.(js|jsx|ts|tsx)"
    ],
    "testEnvironment": "jsdom",
    "testTimeout": 10000,
    "testURL": "http://localhost",
    "transform": {
        "^.+\\.css$": "<rootDir>config/jest/cssTransform.js",
        "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>config/jest/fileTransform.js",
        '^.+\\.[jt]sx?$': "<rootDir>config/jest/tsTransform.js",
    },
    "transformIgnorePatterns": [
        "[/\\\\]node_modules/(?!(axios)/).+\\.(js|jsx|ts|tsx)$",
        "^.+\\.module\\.(css|sass|scss)$"
    ],
    "moduleNameMapper": {
        "^react-native$": "react-native-web",
        "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
        '^react-google-recaptcha$': '<rootDir>/src/mocks/react-google-recaptcha.tsx',
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
        GOOGLE_RECAPTCHA_SITE_KEY: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    }
};
