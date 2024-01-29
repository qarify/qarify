import fs from "node:fs";
import path from "node:path";
import { glob } from 'glob';
import { getLogger } from '@qarify/logger';

const log = getLogger('qarify:nodejs:find-spec-files');

export function findSpecFiles(files: string[], baseDir: string, extensions: string[] = []) {
  const found: string[] = [];
  files.forEach((_filepath) => {
    const filepath = path.isAbsolute(_filepath) ? _filepath : path.join(baseDir, _filepath);
    if (!fs.existsSync(filepath)) {
      let pattern;
      if (glob.hasMagic(filepath, {windowsPathsNoEscape: true})) {
        // Handle glob as is without extensions
        pattern = filepath;
      } else {
        // glob pattern e.g. 'filepath+(.js|.ts)'
        const strExtensions = extensions
          .map(ext => (ext.startsWith('.') ? ext : `.${ext}`))
          .join('|');
        pattern = `${filepath}+(${strExtensions})`;
        log('looking for files using glob pattern: %s', pattern);
      }
      found.push(
        ...glob.sync(pattern, {
          nodir: true,
          windowsPathsNoEscape: true
        }));
    } else {
      if (fs.statSync(filepath).isFile()) {
        found.push(filepath);
      }
      // TODO: handle directory
    }
  });

  return found;
}
