import { defineConfig } from "cypress";
import { initPlugin } from "@frsource/cypress-plugin-visual-regression-diff/plugins";

const SITE_STRING = process.env.CYPRESS_SITE == 'ada' ? 'ada' : 'phy';
const UPDATE_BASELINE = process.env.CYPRESS_UPDATE_BASELINE == 'true';

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig: require(`./config/webpack.config.${SITE_STRING}.cypress.js`)
    },
    indexHtmlFile: `cypress/support/component-index-${SITE_STRING}.html`,
    supportFile: `cypress/support/component-${SITE_STRING}.tsx`,
    setupNodeEvents(on, config) {
      initPlugin(on, config);
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          // Disable smooth scrolling, which can interfere with screenshots
          launchOptions.args.push('--force-color-profile=srgb');
          launchOptions.args.push('--disable-low-res-tiling');
          launchOptions.args.push('--disable-smooth-scrolling');
        }
        return launchOptions;
      });
    }
  },
  env: {
    pluginVisualRegressionImagesPath : `{spec_path}/__image_snapshots__/${SITE_STRING}`,
    pluginVisualRegressionMaxDiffThreshold: 0,
    pluginVisualRegressionUpdateImages: UPDATE_BASELINE,
  }
});
