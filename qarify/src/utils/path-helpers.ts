import fs from "node:fs";
import path from "node:path";

import type { QAConfig, QAProject } from "../types.js";

/**
 * load user config
 *
 * ## config lookup order
 * 1. config file if specified
 * 2. package.json#qarify if exists
 * 3. minimal config
 *
 * ## root directory
 * 1. user defined absolute directory
 * 2. config's basedir if config file is specified
 * 3. package.json's basedir if package.json#qarify exists
 * 4. specified baseDir
 *
 * @param baseDir absolute base directory
 * @param configFile absolute config file path
 * @returns loaded user config object
 */
export async function loadUserConfig(
  baseDir: string,
  configFile?: string
): Promise<Partial<QAConfig>> {
  let userConfig = {} as Partial<QAConfig>;

  if (configFile) {
    if (!path.isAbsolute(configFile)) {
      configFile = path.join(baseDir, configFile);
    }
    if (!fs.existsSync(configFile)) {
      throw new Error("Not found: " + configFile);
    }
    if (configFile.endsWith(".qarifyrc") || configFile.endsWith(".json")) {
      userConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    } else {
      userConfig = (await import(path.resolve(configFile))).default;
    }
    baseDir = path.dirname(configFile);
  } else {
    if (fs.existsSync(path.join(baseDir, ".qarifyrc"))) {
      userConfig = JSON.parse(
        fs.readFileSync(path.join(baseDir, ".qarifyrc"), "utf-8")
      );
    } else {
      //
      // try to load config from package.json
      const packageJSON = findPackageJSON(baseDir);
      if (packageJSON) {
        const pack = JSON.parse(fs.readFileSync(packageJSON, "utf-8"));
        if (pack["qarify"]) {
          userConfig = pack["qarify"];
          baseDir = path.dirname(packageJSON);
        }
      }
    }
  }

  if (!userConfig.rootDir) {
    userConfig.rootDir = baseDir;
  } else {
    if (!path.isAbsolute(userConfig.rootDir)) {
      userConfig.rootDir = path.join(baseDir, userConfig.rootDir);
    }
  }

  return userConfig;
}

export function mapFilesInConfig(projects: QAProject[], outFiles: string[]) {
  for (const project of projects) {
    if (project.testSuites) {
      for (const suite of project.testSuites) {
        const files = [];
        for (const spec of suite.specs) {
          const file = mapFilePath(spec, outFiles);
          if (!file) {
            throw new Error("Not found file: " + spec);
          }
          files.push(file);
        }
        suite.specs = files;
      }
    } else {
      // set specs to all files
      project.testSuites = [
        {
          name: "",
          specs: outFiles,
        },
      ];
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
