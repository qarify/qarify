/**
 * vite.config.ts
 *
 * bundler config for browser
 */

import { resolve, join } from 'node:path'
import { defineConfig, type UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from '../scripts/node-polyfills.js'
import { nodeModuleName, nodeModuleGlobal } from '../scripts/node-modules.js'

const packageName = 'qarify'
const baseDir = __dirname

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
    //
    // build option
    //
    const build: UserConfig['build'] = mode === 'production' ?  {
        lib: {
            name: packageName,
            entry: [
                resolve(baseDir, 'src/index.browser.ts'),
            ],
            formats: ['umd'],
        },
        outDir: join(baseDir, 'dist', '__browser'),
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled into your library
            external: [...nodeModuleName],
            output: {
                // Provide global variables to use in the UMD build for externalized deps
                globals: {
                    ...nodeModuleGlobal,
                },
                exports: 'named',
            },
        },
        minify: false, // <== to check the output of build
    } : {}

    //
    // polyfill plugin
    //
    const polyfill = mode === 'production' ? [] : [nodePolyfills({
        // Whether to polyfill specific globals.
        globals: {
            Buffer: true,
            global: true,
            process: true,
        },
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
        overrides: {
            fs: 'memfs',
        },
    })]

    return {
        define: {
            '_IS_NODE_ENV_': 'false',
            '_IS_BROWSER_ENV_': 'true',
        },
        build,
        plugins: [
            tsconfigPaths({
                projects: [join(baseDir, 'tsconfig.json')],
            }),
            ...polyfill,
        ],
    }
})
