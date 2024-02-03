/**@typedef {typeof nodeModuleName} ModuleName */
/**@typedef {<T = ModuleName> = T extends `node:${infer P}` ? P : never} ModuleNameWithoutNodePrefix */

export const nodeStdModuleName = [
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants',
  'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'http2',
  'module', 'net', 'os', 'path', 'punycode', 'process', 'querystring', 'readline',
  'repl', 'stream', '_stream_duplex', '_stream_passthrough', '_stream_readable',
  '_stream_transform', '_stream_writable', 'string_decoder', 'sys', 'timers/promises',
  'timers', 'tls', 'tty', 'url', 'util', 'vm', 'zlib', 'node:assert', 'node:buffer',
  'node:child_process', 'node:cluster', 'node:console', 'node:constants', 'node:crypto',
  'node:dgram', 'node:dns', 'node:domain', 'node:events', 'node:fs', 'node:http',
  'node:https', 'node:http2', 'node:module', 'node:net', 'node:os', 'node:path',
  'node:punycode', 'node:process', 'node:querystring', 'node:readline', 'node:repl',
  'node:stream', 'node:_stream_duplex', 'node:_stream_passthrough', 'node:_stream_readable',
  'node:_stream_transform', 'node:_stream_writable', 'node:string_decoder', 'node:sys',
  'node:timers/promises', 'node:timers', 'node:tls', 'node:tty', 'node:url', 'node:util',
  'node:vm', 'node:zlib',
]
export const nodeModuleName = [
  ...nodeStdModuleName,
  'fs/promises', 'node:fs/promises',
  'perf_hooks', 'node:perf_hooks',
  'v8', 'node:v8',
]

/**@type {{ [name in ModuleName]: name extends `node:${infer P}` ? `node__${P}` : `node__${name}` }} */
export const nodeModuleGlobal = nodeModuleName.reduce((acc, e) => {
  acc[e] = `node__${e.replace('node:', '')}`
  return acc
}, {})
