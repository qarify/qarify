import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SpecRunnerFramework } from '@qarify/types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const cacheDir = path.join(__dirname, '.qycache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

/**@type {import('@qarify/types').QAConfig} */
export default {
  version: '1.0',
  name: 'test-config',
  rootDir: __dirname,
  framework: SpecRunnerFramework.mocha_qunit,
  specs: [],
  testOptions: {},
  drivers: [],
  cacheDir,
};
