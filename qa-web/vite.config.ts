/**
 * vite.config.ts
 * 
 * bundle-time에 변수들을 static한 값으로 치환하고
 * tree-shaking을 통해 compact한 output을 bundling한다.
 * 
 * nodePolyfill plugin을 통해 웹브라우져에서 기본적인 NodeJS 환경을 제공한다.
 */

import { resolve, join } from 'path';
import { defineConfig, type UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from './scripts/node-polyfills';
import { loadAndfindEnv } from './scripts/vite-utils';

const ROOT_DIR = join(__dirname, '..');
const packages = [
  'qa-types',
  'qa-logger',
  'qa-drivers',
  'qa-pages',
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const build: UserConfig['build'] = mode === 'production' ?  {
    lib: {
      name: 'qarify',
      entry: packages.reduce((acc, e) => ({
        ...acc,
        [e]: resolve(ROOT_DIR, e, 'src', 'index.ts')
      }), {}),
      // es module
      formats: ['es'],
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
        external: [],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {},
        },
      },
      target: "es2022",
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
    resolve: {
      alias: {
        'fs': resolve('./scripts/shims/fs'),
        'node:fs': resolve('./scripts/shims/fs'),
        'node:module': resolve('./scripts/shims/module'),
        'child_process': resolve('./scripts/shims/child_process'),
        'node:child_process': resolve('./scripts/shims/child_process'),
        'node:dns': resolve('./scripts/shims/dns'),
        'node:tls': resolve('./scripts/shims/tls'),
        'node:perf_hooks': resolve('./scripts/shims/perf_hooks'),
        'node:stream': resolve('./scripts/shims/stream'),
        'url': resolve('./scripts/shims/url'),
        'node:url': resolve('./scripts/shims/url'),
        'node:net': resolve('./scripts/shims/net'),
      },
    },
    plugins: [
      tsconfigPaths(
        { projects: ['./tsconfig.bundle.json'] }
      ),
      nodePolyfills({
        // Whether to polyfill specific globals.
        globals: {
          Buffer: false,
          global: true,
          process: true,
        },
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
        overrides: {},
        exclude: [ 'child_process', 'module', 'fs', 'dns', 'tls', 'stream', 'url', 'net' ],
      }),
    ],
  };

  return config;
});

// fs: exclude from nodePolyfilss, alias with memfs from shims/fs
// module: exclude from nodePolyfilss, alias with dummy from shims/module
// child_process: exclude from nodePolyfilss, alias with dummy from shims/child_process
