import type { Plugin, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { PurgeCSS, UserDefinedSafelist } from 'purgecss';
import fs from 'fs/promises';

const resolveSiteSpecificIndexPlugin = (site: "sci" | "ada", renderer?: boolean): Plugin => ({
    /*
        Vite requires an index.html file at the project root. Since we have two sites and each needs its own index.html,
        we use this plugin to load the appropriate site-specific index.html file to replace the default one.
    */
    name: 'site-specific-index-html-plugin',
    enforce: 'pre',
    async transformIndexHtml() {
        return await fs.readFile(`./index-${site}${renderer ? '-renderer' : ''}.html`, 'utf-8');
    }
});

// inspired by https://www.npmjs.com/package/vite-plugin-css-sourcemap and https://www.jsdelivr.com/package/npm/vite-plugin-purgecss;
// plugin to remove unused CSS after build
const purgeCssPlugin = (safeList?: UserDefinedSafelist): Plugin => {
    return {
        name: 'purgecss-plugin',
        enforce: 'post',
        async generateBundle(_options, bundle) {
            const cssFiles = Object.keys(bundle).filter(key => key.endsWith('.css'));
            if (!cssFiles) return;
            for (const file of cssFiles) {
                const css = bundle[file];
                if (css.type !== "asset") continue;
                const purged = await new PurgeCSS().purge({
                    content: ['index*.html', { raw: Object.values(bundle).map(v => { return (v.type === "chunk" ? v.code : ""); }).join("; "), extension: 'js' }],
                    css: [{raw: css.source.toString()}],
                    safelist: safeList || [],
                    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
                });
                (bundle[file] as any).source = purged[0].css;
            }
        }
    };
};

// Plugin to rename the output index HTML file to index.html for nginx
const renameIndexPlugin = (indexPath: string): Plugin => {
    return {
        name: 'rename-index-html-plugin',
        enforce: 'post',
        async generateBundle(_options, bundle) {
            bundle[`${indexPath}`].fileName = bundle[`${indexPath}`].fileName.replace(`${indexPath}`, "index.html");
        }
    };
};

export const generateConfig = (site: "sci" | "ada", renderer?: boolean) => (env: Record<string, any>) => {
    const isRenderer = env['isRenderer'] ?? false;
    // TODO: rename more phy => sci; bottleneck on router config
    const oldStyleSite = site === "sci" ? "phy" : "ada";
    const isBuild = env['command'] === 'build';
    const indexPath = `index-${site}${renderer ? '-renderer' : ''}.html`;
    
    return {
        plugins: [
            !isBuild && resolveSiteSpecificIndexPlugin(site, renderer),
            react({}),
            purgeCssPlugin(),
            renameIndexPlugin(indexPath),
        ],

        build: {
            target: 'es2015', // maximal backwards compatibility
            outDir: renderer ? `build-${oldStyleSite}-renderer` : `build-${oldStyleSite}`,
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: `./${indexPath}`,
                },
                output: {
                    entryFileNames: 'assets/[name].[hash].js',
                    chunkFileNames: 'assets/[name].[hash].js',
                    assetFileNames: 'assets/[name].[hash].[ext]',
                },
            },
        },

        css: {
            devSourcemap: true,
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
