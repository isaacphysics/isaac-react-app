import { defineConfig } from "cypress";
import { initPlugin } from "@frsource/cypress-plugin-visual-regression-diff/plugins";
import { generateConfig } from "./config/vite.config.common";

const SITE_STRING = process.env.CYPRESS_SITE == 'ada' ? 'ada' : 'sci';
const UPDATE_BASELINE = process.env.CYPRESS_UPDATE_BASELINE == 'true';

const config = process.env.CYPRESS_SITE == 'ada' ? generateConfig("ada")({}) : generateConfig("sci")({});

export default defineConfig({
    component: {
        devServer: {
            framework: "react",
            bundler: "vite",
            viteConfig: config,
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
        },
        // @ts-ignore - https://github.com/cypress-io/cypress/issues/16742#issuecomment-2211082722
        devServerPublicPathRoute: '',
    },
    env: {
        pluginVisualRegressionImagesPath : `{spec_path}/__image_snapshots__/${SITE_STRING}`,
        pluginVisualRegressionMaxDiffThreshold: 0,
        pluginVisualRegressionUpdateImages: UPDATE_BASELINE,
        pluginVisualRegressionCreateMissingImages: UPDATE_BASELINE,
    },
});
