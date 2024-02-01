import { fs } from 'memfs';

// const {
//   lstatSync, readdir, readdirSync, readlinkSync, realpathSync, accessSync,
//   existsSync, readFileSync, statSync, writeFileSync, writeFile,
//   createWriteStream, createReadStream, Stats,
//   mkdtempSync, 
// } = fs;
export const {
  lstatSync, readdir, readdirSync, readlinkSync, realpathSync, accessSync,
  existsSync, readFileSync, statSync, writeFileSync, writeFile,
  createWriteStream, createReadStream, Stats,
  mkdtempSync
} = fs;
export default fs;
