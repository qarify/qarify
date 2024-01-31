import { expect as _expect, setOptions, type Expect, type DefaultOptions } from "expect-webdriverio";
import type { InternalDriver } from "@qarify/types";

import { _setGlobal } from "../global/index.js";

export function setGlobalExpect(options?: DefaultOptions, expect?: Expect) {
  _setGlobal("expect", expect || _expect);
  options && setOptions(options);
}

export function setGlobalDriver(driver: InternalDriver, isMultiremote = false) {
  // TODO: InternalDriver to WebdriverIO.Browser
  _setGlobal("browser", driver);
  _setGlobal("driver", driver);
  // _setGlobal("$", driver.$.bind(driver));
  // _setGlobal("$$", driver.$$.bind(driver));
  if (isMultiremote) {
    _setGlobal("multiremotebrowser", driver);
  }
}
