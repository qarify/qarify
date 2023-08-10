import fs from 'fs';
import path from 'path';
// import url from 'node:url';
import type {
  Task, Spec, QAConfig
} from './types';

export function parseConfig(config: QAConfig) {

}

function run(config: QAConfig) {
  const project = config.projects[0];
  const {
    cacheDir
  } = config;
  const {
    name,
    connection,
    testSuite,
  } = project;

  const rootDir = path.join(__dirname, '..'); // config file dir
  const _cacheDir = path.isAbsolute(cacheDir) ? cacheDir : path.join(rootDir, cacheDir).normalize();
  const outDir = path.join(_cacheDir, 'out');
  const genDir = path.join(_cacheDir, 'gen');
  const tsConfigPath = path.join(_cacheDir, 'tsconfig.json');

  console.log('>>> rootDir:', rootDir);
  console.log('>>> outDir:', outDir);
  console.log('>>> genDir:', genDir);

  console.log('>>> Run', name);

  console.log('>>> gen tsconfig...', tsConfigPath);
  // TODO: gen tsconfig
  console.log('>>> gen tsconfig done.');

  console.log('>>> build...');
  // TODO: build
  console.log('>>> build done.');

  console.log('>>> compose test cases');
  const { testCases } = testSuite;
  for (const tc of testCases) {
    console.log('>>> composing', tc.name);
    const { preTasks, specs, postTasks } = tc;

    const _preTasks = preTasks.map((e: any) => ({
      ...e,
      path: findRelativePath(
        path.join(outDir, e.path).normalize(), genDir
      )
    }));
    const _postTasks = postTasks.map((e: any) => ({
      ...e,
      path: findRelativePath(
        path.join(outDir, e.path).normalize(), genDir
      )
    }));
    const _specs = specs.map((e: any) => ({
      ...e,
      path: findRelativePath(
        path.join(outDir, e.path).normalize(), genDir
      )
    }));
    // console.log('>>> preTasksPaths:', preTasksPaths);
    genSpecFile(path.join(genDir, `${tc.id}.spec.js`), _preTasks, _specs, _postTasks, tc.name);
  }
}

function removeExtension(fileName: string) {
  const extensions = ['.js', '.ts', '.mjs', '.cjs', '.mts', '.cts'];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return fileName.replace(ext, '');
    }
  }
  return fileName;
}

function findRelativePath(origin: string, newBase: string) {
  console.log('origin:', origin, 'base:', newBase);
  const oarr = origin.split(path.sep);
  const barr = newBase.split(path.sep);
  console.log('>>> oarr:', oarr);
  let count = 0;
  while (count < barr.length && oarr[count] === barr[count]) {
    count++;
  }
  const dotCount = barr.length - count;
  console.log('>>> dotCount:', dotCount);
  const relPath = dotCount === 0 ? ['.'] : Array.from({length: dotCount}).map(() => '..');
  while (count < oarr.length) {
    relPath.push(oarr[count++]);
  }
  return relPath.map(removeExtension).join('/');
}

function genSpecFile(filePath: string, preTasks: Task[], specs: Spec[], postTasks: Task[], caseName: string) {
  const lines = [];
  lines.push(`module.exports = {`);
  if (preTasks.length > 0) {
    lines.push(`before: async function () {`);
    preTasks.forEach((e) => lines.push(`require('${e.path}').default();`));
    lines.push(`},`);
  }
  if (postTasks.length > 0) {
    lines.push(`after: async function () {`);
    postTasks.forEach((e) => lines.push(`require('${e.path}').default();`));
    lines.push(`},`);
  }
  if (specs.length > 0) {
    lines.push(`Array: {`);
      lines.push(`'${caseName}': {`);
        specs.forEach((e) => lines.push(`'${e.name}': require('${e.path}').default,`));
      lines.push(`}`);
    lines.push(`}`);
  }
  lines.push(`};`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true});
  fs.writeFileSync(filePath, lines.join('\n'));
}