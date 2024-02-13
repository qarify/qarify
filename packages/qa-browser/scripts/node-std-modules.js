
export const nodeStdModuleNames = [
  'assert', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'dns', 'domain',
  'events', 'fs', 'fs/promises', 'http', 'https', 'http2',
  'module', 'net', 'os', 'path', 'punycode',
  'process', 'querystring', 'readline', 'repl', 'stream',
  '_stream_duplex', '_stream_passthrough', '_stream_readable', '_stream_transform', '_stream_writable',
  'string_decoder', 'sys', 'timers/promises', 'timers', 'tls', 
  'tty', 'url', 'util', 'vm', 'zlib', 'perf_hooks', 'v8',
];
export const nodeStdModuleNamesWithProtocol = nodeStdModuleNames.map(e => `node:${e}`);
export const nodeStdModuleNamesAll = [
  ...nodeStdModuleNames, ...nodeStdModuleNamesWithProtocol
];

// convert module name to variable string
const mod2var = (/**@type {string}*/mod) => mod.replace(/[\W_]+/g, '__');

/**
 * map for node std module and it's global variable name
 * e.g. 'fs' and 'node:fs' will map to 'node__fs'
 * e.g. 'fs/promise' and 'node:fs/promises' will map to 'node__fs__promises'
 */
export const nodeStdModuleGlobalMap = nodeStdModuleNames.reduce((acc, e) => ({
    ...acc,
    [e]: `node___${mod2var(e)}`,
    [`node:${e}`]: `node___${mod2var(e)}`,
  }), {});
