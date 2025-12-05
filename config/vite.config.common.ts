import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import htmlPurge from 'vite-plugin-html-purgecss'
import fs from 'fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const resolveSiteSpecificIndexPlugin = (site: "sci" | "ada") => ({
    /*
        Vite requires an index.html file at the project root by default. Since we have two sites and each needs its own index.html,
        we use this plugin to load the appropriate site-specific index.html file to replace the default one.
    */
    name: 'site-specific-index-html',
    enforce: 'pre',
    async transformIndexHtml() {
        return await fs.readFile(`./index-${site}.html`, 'utf-8');
    }
}) as Plugin;

export const generateConfig = (site: "sci" | "ada") => (env: any) => {
    let isProd = env['prod'] ?? false;
    let isRenderer = env['isRenderer'] ?? false;
    
    return {
        plugins: [
            resolveSiteSpecificIndexPlugin(site),
            react(),
            htmlPurge() as Plugin,
        ],

        build: {
            target: 'es2015', // maximal backwards compatibility
        },

        define: {
            REACT_APP_API_VERSION: `"${process.env.REACT_APP_API_VERSION}"`,
            ENV_QUIZ_FEATURE_FLAG: process.env.QUIZ_FEATURE && process.env.QUIZ_FEATURE.trim() === "true",
            EDITOR_PREVIEW: JSON.stringify(isRenderer),

            ISAAC_SITE: JSON.stringify(site === 'sci' ? 'physics' : 'ada'),
        }
    } satisfies UserConfig;
};
