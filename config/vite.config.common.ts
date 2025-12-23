import type { Plugin, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import htmlPurge from 'vite-plugin-html-purgecss';
import fs from 'fs/promises';

const resolveSiteSpecificIndexPlugin = (site: "sci" | "ada", renderer?: boolean): Plugin => ({
    /*
        Vite requires an index.html file at the project root. Since we have two sites and each needs its own index.html,
        we use this plugin to load the appropriate site-specific index.html file to replace the default one.
    */
    name: 'site-specific-index-html',
    enforce: 'pre',
    async transformIndexHtml() {
        return await fs.readFile(`./public/index-${site}${renderer ? '-renderer' : ''}.html`, 'utf-8');
    }
});

export const generateConfig = (site: "sci" | "ada", renderer?: boolean) => (env: Record<string, any>) => {
    const isRenderer = env['isRenderer'] ?? false;
    
    return {
        plugins: [
            resolveSiteSpecificIndexPlugin(site, renderer),
            react({}),
            htmlPurge() as Plugin,
        ],

        build: {
            target: 'es2015', // maximal backwards compatibility
            outDir: renderer ? `build-${site}-renderer` : `build-${site}`,
            emptyOutDir: true,
        },

        css: {
            preprocessorOptions: {
                scss: {
                    // https://github.com/twbs/bootstrap/issues/40962 – should be able to remove when Bootstrap 6 is available
                    silenceDeprecations: ['mixed-decls'],
                },
            },
        },

        define: {
            REACT_APP_API_VERSION: `"${process.env.REACT_APP_API_VERSION}"`,
            ENV_QUIZ_FEATURE_FLAG: process.env.QUIZ_FEATURE && process.env.QUIZ_FEATURE.trim() === "true",
            EDITOR_PREVIEW: JSON.stringify(isRenderer),
            ISAAC_SITE: JSON.stringify(site),
        }
    } satisfies UserConfig;
};
