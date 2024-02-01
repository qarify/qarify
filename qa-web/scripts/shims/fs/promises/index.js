import { fs } from 'memfs';
const { lstat, readdir, readlink, realpath, mkdir, mkdtemp, unlink, rename } = fs.promises;
export {
    lstat, readdir, readlink, realpath, mkdir, mkdtemp, unlink, rename,
};
export default fs.promises;
