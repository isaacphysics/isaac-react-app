import { defineConfig } from "cypress";
import { initPlugin } from "@frsource/cypress-plugin-visual-regression-diff/plugins";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig: require('./config/webpack.config.ada.js')
    },
    setupNodeEvents(on, config) {
      initPlugin(on, config);
    }
  },
});
