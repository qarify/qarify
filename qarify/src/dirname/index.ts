import { getModuleType } from "../utils/platform.js";

export default async function dirname() {
  // vite build 시 dynamic import는 제약이 있다.
  // For details, https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  // import()를 vite dynamic import 제약에 맞추면
  // tsc compile 시 es module code(import.meta)가 포함되어 common js 타겟 빌드시
  // 에러가 발생한다.
  // TODO: support cjs
  const type = getModuleType() === 'module' ? 'esm' : 'cjs'
  let dirname: string = (await import(`./dirname-${type}.js`)).default;
  return dirname;
}
