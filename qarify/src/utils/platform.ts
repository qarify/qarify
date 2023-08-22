
export const isBrowser = new Function('try{return this===window;}catch{return false;}');
export const isNode = new Function('try{return this===global;}catch{return false;}');
export function getModuleType() {
  const isCJS = new Function('try{return typeof require==="function";}catch{return false;}');
  // const isESM = new Function('try{return typeof import.meta==="object";}catch{return false;}');
  return isCJS() ? 'commonjs' : 'module';
}
