import { defineConfig } from "cypress";
import { initPlugin } from "@frsource/cypress-plugin-visual-regression-diff/plugins";
import {SITE} from "./src/app/services";

const SITE_STRING = process.env.CYPRESS_SITE == 'ada' ? 'ada' : 'phy';

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig: process.env.CYPRESS_SITE == 'ada' ?
          require(`./config/webpack.config.ada.js`) : require(`./config/webpack.config.physics.js`)
    },
    indexHtmlFile: `cypress/support/component-index-${SITE_STRING}.html`,
    supportFile: `cypress/support/component-${SITE_STRING}.ts`,
    setupNodeEvents(on, config) {
      initPlugin(on, config);
    }
  },
  env: {
    pluginVisualRegressionImagesPath : `{spec_path}/__image_snapshots__/${SITE_STRING}`
  }
});
