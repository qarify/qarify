import fs from "node:fs";
import path from "node:path";
import type { Task, Spec } from "./types";

export function genESMSpecFile(
  filePath: string,
  preTasks: Task[],
  specs: Spec[],
  postTasks: Task[],
  caseName: string
) {
  const lines = [];
  lines.push(`export default {`);
  if (preTasks.length > 0) {
    lines.push(`before: async function () {`);
    preTasks.forEach((e) =>
      lines.push(`await (await import('${e.path}')).default();`)
    );
    lines.push(`},`);
  }
  if (postTasks.length > 0) {
    lines.push(`after: async function () {`);
    postTasks.forEach((e) =>
      lines.push(`await (await import('${e.path}')).default();`)
    );
    lines.push(`},`);
  }
  if (specs.length > 0) {
    // lines.push(`Array: {`);
    lines.push(`'${caseName}': {`);
    specs.forEach((e) =>
      lines.push(`'${e.name}': (await import('${e.path}')).default,`)
    );
    lines.push(`}`);
    // lines.push(`}`);
  }
  lines.push(`};`);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join("\n"));
}

export function genCJSSpecFile(
  filePath: string,
  preTasks: Task[],
  specs: Spec[],
  postTasks: Task[],
  caseName: string
) {
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
    // lines.push(`Array: {`);
    lines.push(`'${caseName}': {`);
    specs.forEach((e) =>
      lines.push(`'${e.name}': require('${e.path}').default,`)
    );
    lines.push(`}`);
    // lines.push(`}`);
  }
  lines.push(`};`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join("\n"));
}
