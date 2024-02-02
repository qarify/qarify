/**
 * vite.config.ts
 * 
 * bundle-time에 변수들을 static한 값으로 치환하고
 * tree-shaking을 통해 compact한 output을 bundling한다.
 * 
 * nodePolyfill plugin을 통해 
 *   - 웹브라우저에서 기본적인 NodeJS 환경을 제공
 *   - 웹브라우저 환경에서 지원되지 않는 기능을 dummy library로 대체
 * 한다.
 * 
 * # nodePolyfill plugin
 * - `node-stdlib-browser` package를 통해 node modules들을 overriding 한다.
 * - node module을 별도로 overriding 하려면 `plugins.nodePolyfills.exclude` options에 해당 module name을 추가하고
 * - `UserConfig.resolve.alias` option에 해당 module을 지정한다.
 */

import { resolve } from 'path';
import { defineConfig, type UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import typescript from 'rollup-plugin-typescript2';
// import { nodePolyfills } from './scripts/node-polyfills';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { loadAndfindEnv } from './scripts/vite-utils';

const externalized_node_modules = [
  'url', 'module', 'path', 'events', 'fs', 'fs/promises', 'os', 'v8', 'stream', 'net', 'tls', 'http', 'https', 'http2',
  'perf_hooks', 'child_process', 'repl', 'assert', 'util', 'process', 'buffer', 'vm', 'zlib', 'dns', 'crypto', 'constants'
];
const externalized_modules = [
  'safaridriver', 'geckodriver', 'edgedriver', '@puppeteer/browsers',
];
const rollupExternal = [
  ...externalized_modules, ...externalized_node_modules, ...externalized_node_modules.map(e => `node:${e}`),
];
const mod2var = (mod: string) => mod.replace(/[\W_]+/g, '_');
const rollupGlobals = {
  ...externalized_modules.reduce((acc, e) => ({ ...acc, [e]: mod2var(e) }), {}),
  ...externalized_node_modules.reduce((acc, e) => ({ ...acc, [e]: mod2var(e) }), {}),
  ...externalized_node_modules.reduce((acc, e) => ({ ...acc, [`node:${e}`]: mod2var(e) }), {}),
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const build: UserConfig['build'] = mode === 'production' ?  {
    lib: {
      name: 'qarify-browser',
      entry: resolve(__dirname, 'src', 'index.ts'),
      formats: mode === 'production' ? ['es', 'umd'] : ['es'],
      fileName: 'qarify-browser',
    },
    outDir: './dist',
    minify: true,
  } : {};

  const config: UserConfig = {
    build: {
      minify: false,
      ...build,
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: rollupExternal,
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: rollupGlobals
        },
      },
      target: "es2022",
      emptyOutDir: mode === 'production',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022',
        minify: false,
      }
    },
    define: {
      ...loadAndfindEnv('APP_', mode),
      '_IS_NODE_ENV_': 'false',
      '_IS_BROWSER_ENV_': 'true',
    },
    plugins: [
      tsconfigPaths(
        { projects: ['./tsconfig.bundle.json'] }
      ),
      nodePolyfills({
        // // Whether to polyfill specific globals.
        // globals: {
        //   Buffer: false,
        //   global: true,
        //   process: true,
        // },
        // // Whether to polyfill `node:` protocol imports.
        // protocolImports: true,
        // overrides: {},
        // exclude: [ 'child_process', 'module', 'fs', 'dns', 'stream', 'url' ],
      }),
      typescript({
        tsconfig: resolve(__dirname, 'tsconfig.bundle.json'),
        tsconfigDefaults: {
          compilerOptions: {
            sourceMap: false,
            declaration: true,
            declarationMap: true
          },
        },
        check: false,
      }),
    ],
    resolve: {
      alias: {
        // 'fs': resolve('./scripts/shims/fs'),
        // 'node:fs': resolve('./scripts/shims/fs'),
        // 'node:module': resolve('./scripts/shims/module'),
        // 'child_process': resolve('./scripts/shims/child_process'),
        // 'node:child_process': resolve('./scripts/shims/child_process'),
        // 'node:dns': resolve('./scripts/shims/dns'),
        // 'node:perf_hooks': resolve('./scripts/shims/perf_hooks'),
        // 'node:stream': resolve('./scripts/shims/stream'),
        // 'url': resolve('./scripts/shims/url'),
        // 'node:url': resolve('./scripts/shims/url'),
        '@wdio/logger': resolve('./scripts/shims/wdio-logger'),
      },
    },
  };

  return config;
});
