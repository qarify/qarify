import fs from 'fs';
import path from 'path';
import { loadEnv } from 'vite';

/**
 * create env object for replacement
 * 
 * @param prefix prefix of a name of process.env
 * @param mode 'development' | 'production'
 * @returns 
 */
export function loadAndFindEnv(prefix: string, envName: string, mode: string, envDir?: string) {
  // Load env file based on `mode` in the current working directory.
  // And create env object with the loaded value
  envDir = envDir || process.cwd();
  const envFile = findEnvFile(envName, mode, envDir);
  const envApp = loadEnv(envFile, envDir, prefix);
  const processEnv = Object.keys(envApp).reduce((acc, e) => {
    acc[`process.env.${e}`] = JSON.stringify(envApp[e]);
    return acc;
  }, {} as Record<string, string>);

  return processEnv;
}

function findEnvFile(envName: string, mode: string, envDir?: string) {
  const candidates = [
    `.env.${envName}.${mode}.local`,
    `.env.${envName}.${mode}`,
    `.env.${envName}`,
    `.env`,
  ];
  for (const name of candidates) {
    if (fs.existsSync(path.join(envDir, name))) return name;
  }
  throw new Error(`No env file, ${envName} under ${envDir}`);
}
