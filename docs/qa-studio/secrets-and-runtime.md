# Secrets (.env) and Browser Runtime Configuration

Two things introduced in v0.76-1: keeping passwords out of your suite files with `@qarify/dotenv-plugin`, and
choosing how the browser is launched with the `runtime` setting.

## Prerequisites

- [Install QA Studio](./install.md), a project with at least one suite ([Quick Start](./quick-start.md))

## 1. Keep secrets out of suites: dotenv-plugin

The plugin fills `case.data` keys from environment variables or a `.env` file just before each case runs.
Suites only contain `<<data.password>>`; the real value never lives in suite JSON.

### Enable it

Add an entry to the `plugins` array of the project config. `map` is required: `{ "<data key>": "<ENV VAR NAME>" }`.

```json
{
  "plugins": [
    [
      "@qarify/dotenv-plugin",
      {
        "map": { "password": "QY_PASSWORD", "api_token": "QY_API_TOKEN" }
      }
    ]
  ]
}
```

Then reference the key in a step, for example `setValue` with `text: "<<data.password>>"`, and put the value in
`.env` at the project root:

```
QY_PASSWORD=s3cret
```

### Options

| Option             | Default   | Meaning                                                                                                         |
| ------------------ | --------- | --------------------------------------------------------------------------------------------------------------- |
| `map`              | required  | Data key to env var name. Both must match `[A-Za-z_][A-Za-z0-9_]*`. No prefix magic: only mapped keys are read. |
| `file`             | `.env`    | One path or an array, relative to the project root. Later files override earlier ones.                          |
| `precedence`       | `process` | `process`: a real environment variable wins over the file. `file`: the file wins.                               |
| `optional`         | `[]`      | Data keys that may be missing. They are skipped instead of failing the case.                                    |
| `override`         | `false`   | Replace a value already present in `case.data`. Without it a conflict fails the case.                           |
| `allowOutsideRoot` | `false`   | Allow `file` paths outside the project root (symlinks pointing outside are rejected too).                       |

Unknown options are rejected at start-up (`dotenv-plugin: invalid options (...)`); the run then continues
without the plugin.

### Behavior you should know

- **Empty counts as missing.** A mapped key that is missing or empty (in both the environment and the file) fails
  that case before any step with: `dotenv-plugin: data key "password" requires env var "QY_PASSWORD", which is
missing or empty ... Fill it in and re-run.` Mark the key `optional` to skip it instead.
- **A copy is injected.** The suite file and what Studio holds are never modified.
- **Masking.** Injected values are registered with the secret masker: they are replaced in logs, reports, error
  messages and events. Residuals (see Limitations): logs of external modules, page DOM snapshots that already
  contain the value, screenshots.
- **`.env` format.** Plain `KEY=value`, quotes and multi-line quoted values are supported; `$VAR` expansion is not
  done. A `case.data` value that is exactly the old recording placeholder (`••••••`) is replaced, with a warning.
- Keep `.env` out of git. The plugin only warns about this; it never edits `.gitignore`.

### Recording conversion

When a recording containing a password field is converted to a suite (both `user-event` and tool modes), the
password is no longer written as a literal or a `••••••` placeholder. Instead:

1. The step gets `<<data.<key>>>` where the key is derived from the field (`id`, `name`, `data-testid`,
   `aria-label`, otherwise `password`; repeats get `_2`, `_3`). Typing into the same field twice reuses one key.
2. The env var name is `QY_` plus the upper-cased key (for example `QY_PASSWORD`).
3. `.env` is created if missing, otherwise only missing keys are appended with a blank value. Existing lines,
   comments and values are preserved byte for byte. `.env.example` gets the keys only.
4. The `dataKey -> envVar` pair is added to the plugin `map` in the project config (existing entries are never
   changed).
5. If `.env` is not covered by `.gitignore`, a warning is written to the Studio log.

Fill in the blank value in `.env` and run the suite. Older suites with a `••••••` placeholder are covered too:
mapping that data key makes the plugin replace the placeholder.

### Troubleshooting

| Symptom                                                 | Fix                                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Case fails: `requires env var "QY_X", which is missing` | Set it in the process environment or `.env`, or list the key in `optional`. |
| Case fails: `already exists in the case data`           | Remove the key from the case `data`, or set `override: true`.               |
| `file ... resolves outside the project root`            | Move the file inside the project or set `allowOutsideRoot: true`.           |
| Plugin silently absent                                  | Check the log for `invalid options`; `map` is mandatory.                    |

## 2. Browser runtime configuration

`runtime` describes which browser engine is used and how it is launched. It can be set at four levels; later
levels win:

1. Project: `testRun.<platform>.runtime` in the project config (the older `headless` / `capabilities` fields still work; an explicit `runtime` wins key by key)
2. CLI: `--headless`, `--relaxed`
3. Suite: `runtime` on a suite (ancestors first, then the nearest suite)
4. Case: `runtime` on a test case

```json
{
  "runtime": {
    "type": "webdriver",
    "headless": true,
    "args": ["--lang=ko"],
    "windowSize": { "width": 1280, "height": 900 },
    "timeouts": { "implicit": 1000, "pageLoad": 30000, "script": 30000 }
  }
}
```

`type` may be omitted: the layer then inherits the type from the levels below. Options the type does not
support are validation errors, not silently ignored. `type: "devtool"` validates but is not implemented in this
version: a case that needs it fails with `devtool runtime is not implemented`.

The chat assistant can set a suite `runtime` too (it is part of the suite schema the assistant edits).

### Options for `webdriver`

| Option         | Class   | Meaning                                                                         |
| -------------- | ------- | ------------------------------------------------------------------------------- |
| `headless`     | restart | No visible window.                                                              |
| `args`         | restart | Extra browser switches, appended and de-duplicated by switch name (later wins). |
| `relaxed`      | restart | Opt in to the relaxed profile (below).                                          |
| `capabilities` | restart | Raw W3C capabilities; deep-merged.                                              |
| `connection`   | restart | WebDriver server `protocol`, `hostname`, `port`, `path`, `logLevel`.            |
| `windowSize`   | live    | `{width, height}`; default 800x1000.                                            |
| `timeouts`     | live    | `implicit`, `pageLoad`, `script` in ms.                                         |

### Restart contract

- **Restart options** decide whether the browser is replaced. Cases whose effective restart options are identical
  share one browser (one launch for N cases). When a case (or suite) changes a restart option, the browser is
  restarted at the next case boundary, never in the middle of a case, and a warning names the option (for
  example `case "c" overrides restart options [headless]; browser state (cookies, login) will be lost on restart`).
- **Live options** (`windowSize`, `timeouts`) are applied to the running browser. They never cause a restart.
- Cases that only use value assertions (no browser tools) never launch a browser.
- A problem in runtime configuration or a failed launch fails that case before any step; the run continues with
  the next case.
- If the browser session was supplied by a caller (embedding the runner with an existing driver), the runner
  cannot restart it: a case that changes restart options fails with an error naming the differing options.

### Relaxed profile (opt in)

Web security is on by default. `runtime.relaxed: true` (or the CLI flag `--relaxed`) adds
`--disable-web-security`, which lets scripts read cross-origin frame content. It was chosen by measuring the
cross-origin frame scenarios: wider profiles (site isolation flags, insecure content) changed nothing else, so
this is the smallest profile. Use it only for tests that need it, ideally on one suite/case rather than the
project.

```bash
qy run --relaxed        # CLI: opt in for this run (also `qy suite run --relaxed`)
```

## Limitations

- A run started from a nested suite in Studio does not apply the `runtime` of ancestor suites (only the started
  node's own and the project/CLI layers).
- `devtool` runtime and MCP tool provider are not available yet.
- Masking cannot cover logs of external modules, page DOM snapshots taken by the browser itself, or screenshots.
  A multi-line secret masks each of its lines, so a common line may be masked elsewhere in output.
