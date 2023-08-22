import { getModuleType } from "../utils/platform.js";

const _importDynamic = new Function('modulePath', 'return import(modulePath)');

export default async function dirname() {
  let dirname: string = (await _importDynamic(getModuleType() === 'module' ? './dirname.mjs' : './dirname.cjs')).default;
  return dirname;
}
