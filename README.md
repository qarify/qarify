# QArify

## Major Scripts

- `setup`
  - install deps
  - build
  - link qarify packages using `npm link`
  - See [setup.sh](./scripts/setup.sh)
- `build`: clean-build packages
- `compile`: build changed files
- `test`: run unit tests
- `e2e`: run e2e tests
- `test:types`: check types
- `link:deps`: run `npm link` with deps packages, such as `webdriverio`
- `patch:vsce`: vscode extension에서 사용하기 위한 patch를 적용함

## TODO

- [] generate spec files from qa-spec.json
