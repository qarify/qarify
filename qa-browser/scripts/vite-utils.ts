import { loadEnv } from 'vite';

/**
 * create env object for replacement
 * 
 * @param prefix prefix of a name of process.env
 * @param mode 'development' | 'production'
 * @returns 
 */
export function loadAndfindEnv(prefix: string, mode: string, isVSCE=false) {
  // Load env file based on `mode` in the current working directory.
  // And create env object with the loaded value
  const envApp = loadEnv(isVSCE ? 'vsce' : 'web', process.cwd(), prefix);
  const processEnv = Object.keys(envApp).reduce((acc, e) => {
    acc[`process.env.${e}`] = JSON.stringify(envApp[e]);
    return acc;
  }, {} as Record<string, string>);

  return processEnv;
}
