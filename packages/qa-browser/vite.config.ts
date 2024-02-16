/// <reference types="vitest" />
/// <reference types="vite/client" />
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
import { nodePolyfills } from 'vite-plugin-ti-browserify'
import typescript from 'rollup-plugin-typescript2';
import { loadAndFindEnv } from './scripts/vite-utils';
//@ts-ignore
import packageJson from './package.json' assert { type: 'json' };

const resolveAliases = {
  'safaridriver':resolve('./scripts/shims/safaridriver'),
  'geckodriver':resolve('./scripts/shims/geckodriver'),
  'edgedriver':resolve('./scripts/shims/edgedriver'),
  'puppeteer-core': resolve('./scripts/shims/puppeteer-core'),
  '@wdio/logger': resolve('./scripts/shims/wdio-logger'),
  'node:repl': resolve('./scripts/shims/empty'),
  'node:v8': resolve('./scripts/shims/empty'),
  'node:perf_hooks': resolve('./scripts/shims/node/perf_hooks'),
  'got': resolve('./scripts/shims/empty'),
  'graceful-fs': resolve('./scripts/shims/empty'),
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // build config for production(bundling)
  const build: UserConfig['build'] = mode === 'production' ?  {
    lib: {
      name: 'qarify_browser',
      entry: 'src/index.ts',
      formats: ['es', 'umd'],
      fileName: 'qarify-browser',
    },
    outDir: './dist',
    minify: false,
    emptyOutDir: true,
  } : {};

  // plugins config for production(bundling)
  const plugins: UserConfig['plugins'] = mode === 'production' ? [
    // N.B
    // For 'test' mode, you may get the following error, when using this plugin.
    // 'TS2742: The inferred type...'
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationMap: true,
        }
      }
    }),
    // tsconfigPaths(
    //   { projects: ['./tsconfig.bundle.json'] }
    // ),
  ] : [];

  const config: UserConfig = {
    build: {
      minify: false,
      emptyOutDir: false,
      ...build,
    },
    define: {
      ...loadAndFindEnv('APP_', 'browser', mode),
      '_IS_NODE_ENV_': 'false',
      '_IS_BROWSER_ENV_': 'true',
    },
    plugins: [
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        overrides: {
          //@ts-ignore
          'fs/promises': resolve('./scripts/shims/node/fs/promises'),
          fs: resolve('./scripts/shims/node/fs'),
        },
        protocolImports: true,
      }),
      ...plugins,
    ],
    resolve: {
      alias: {
        ...resolveAliases,
      },
    },
    // Configure Vitest (https://vitest.dev/config/)
    test: {
      globals: true,
      environment: 'jsdom',
      browser: {
        enabled: mode === 'browser_test',
        name: "chromium",
        provider: "playwright"
      },
      setupFiles: [
        `./test/${mode}-setup.ts`, // test | browser_test | e2e_test
      ],
      pool: 'forks',
      testTimeout: 10_000, // 10 seconds
    },
  };

  return config;
});

