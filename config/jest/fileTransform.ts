import path from 'node:path';
import type { Transformer } from '@jest/transform';

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

const transformer: Transformer = {
    process(_sourceText, filename) {
        const assetFilename = JSON.stringify(path.basename(filename));

        if (/\.svg$/.test(filename)) {
            return {
                code: `
                    import React from 'react'

                    export default {
                        __esModule: true,
                        default: ${assetFilename},
                        ReactComponent: React.forwardRef((props, ref) => ({
                            $$typeof: Symbol.for('react.element'),
                            type: 'svg',
                            ref,
                            key: null,
                            props: Object.assign({}, props, {
                                children: ${assetFilename}
                            })
                        }))
                    };
                    `,
            };
        }

        return {
            code: `module.exports = ${assetFilename};`,
        };
    },
};

export default transformer;
