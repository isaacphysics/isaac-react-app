const config = {
    babelConfig: {
        presets: [
            "@babel/preset-env",
            "@babel/preset-react",
            "@babel/preset-typescript"
        ]
    }
};
module.exports = require("ts-jest").default.createTransformer(config);