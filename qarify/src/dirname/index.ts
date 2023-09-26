import { getModuleType } from "../utils/platform.js";

export default async function dirname() {
  let dirname: string = (await import(getModuleType() === 'module' ? './dirname.mjs' : './dirname.cjs')).default;
  return dirname;
}
