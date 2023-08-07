"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect_webdriverio_1 = require("expect-webdriverio");
function default_1() {
    const greeting = 'hello';
    (0, expect_webdriverio_1.expect)(greeting).toBe('hello');
}
exports.default = default_1;
;
