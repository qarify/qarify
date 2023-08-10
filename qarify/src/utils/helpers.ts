import fs from "node:fs";
import path from "node:path";

import type { QAConfig, QAProject } from '../types.js';

export async function loadUserConfig(
  baseDir: string,
  configFile?: string
): Promise<QAConfig | undefined> {
  if (configFile) {
    if (!fs.existsSync(configFile)) {
      throw new Error("Not found: " + configFile);
    }
    if (configFile.endsWith(".qarifyrc") || configFile.endsWith(".json")) {
      return JSON.parse(fs.readFileSync(configFile, "utf-8")) as QAConfig;
    }
    return (await import(path.resolve(configFile))).default as QAConfig;
  }
  const packageJSON = findPackageJSON(baseDir);
  if (packageJSON) {
    const pack = JSON.parse(fs.readFileSync(packageJSON, "utf-8"));
    return pack["qarify"] as QAConfig;
  }
  return undefined;
}

export function mapFilesInConfig(projects: QAProject[], outFiles: string[]) {
  for (const project of projects) {
    for (const suite of project.testSuites) {
      const files = [];
      for (const spec of suite.specs) {
        const file = mapFilePath(spec, outFiles);
        if (!file) {
          throw new Error("Not found file: " + suite);
        }
        files.push(file);
      }
      suite.specs = files;
    }
  }
}

function mapFilePath(file: string, files: string[]) {
  const arr = replaceToJSExtension(file).split("/");
  let pos = arr.length - 1;
  do {
    const file = files.filter((e) => e.endsWith(arr.slice(pos).join("/")));
    if (file.length === 1) {
      return file[0];
    }
  } while (pos-- > 0);
  return null;
}

function replaceToJSExtension(fileName: string) {
  const extensionMap = [
    ".ts",
    ".js",
    ".mts",
    ".mjs",
    ".cts",
    ".cjs",
    ".tsx",
    ".jsx",
  ];
  let i = 0;
  do {
    if (fileName.endsWith(extensionMap[i])) {
      return fileName.replace(extensionMap[i], extensionMap[i + 1]);
    }
    i += 2;
  } while (i < extensionMap.length);
  return fileName;
}

export function findAllFiles(dir: string, files?: string[]) {
  if (!files) {
    files = [];
  }
  fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
    if (dirent.isDirectory()) {
      findAllFiles(path.join(dir, dirent.name), files);
    } else {
      files?.push(path.join(dir, dirent.name));
    }
  });
  return files;
}

function findPackageJSON(dir: string) {
  do {
    const pack = path.join(dir, "package.json");
    if (fs.existsSync(pack)) {
      return pack;
    }
    dir = path.dirname(dir);

    // / => ['', '']
    // C:\\ => ['C:', '']
  } while (dir.split(path.sep)[1]);

  return null;
}

export function isTS(fileName: string) {
  const extensions = [".ts", ".tsx", ".mts", ".cts"];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return true;
    }
  }
  return false;
}
