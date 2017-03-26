"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Flyout_1 = require("./Flyout");
var PasteSafe_1 = require("./PasteSafe");
var flyout = new Flyout_1.default({
    baseplate: document.querySelector(".baseplate"),
    toggleButtons: Array.from(document.querySelectorAll(".flyout-toggle-button"))
});
var pasteSafe = new PasteSafe_1.default({
    root: document.querySelector("[paste-safe]")
});
//# sourceMappingURL=main.js.map