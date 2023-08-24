import fs from "node:fs";
import path from "node:path";

import { getLogger } from "../logger/logger.js";

const log = getLogger('qarify:utils:path-helpers');

export function mapFilesInConfig(specFiles: string[], outFiles: string[]) {
  const files = [];
  for (const spec of specFiles) {
    const file = mapFilePath(spec, outFiles);
    if (!file) {
      throw new Error("Not found file: " + spec);
    }
    files.push(file);
  }
  return files;
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

export function isTS(fileName: string) {
  const extensions = [".ts", ".tsx", ".mts", ".cts"];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return true;
    }
  }
  return false;
}
