"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('[TASK] hello');
            resolve();
        }, 1000);
    });
}
exports.default = default_1;
