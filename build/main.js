"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Flyout_1 = require("./Flyout");
var PasteSafe_1 = require("./PasteSafe");
// Forcing HTTPS in production.
var production = /github\.io/i.test(window.location.host) || /pastesafe\.com/i.test(window.location.host);
if (production && !/https/i.test(window.location.protocol))
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
var flyout = new Flyout_1.default({
    baseplate: document.querySelector(".baseplate"),
    toggleButtons: Array.from(document.querySelectorAll(".flyout-toggle-button"))
});
var pasteSafe = new PasteSafe_1.default({
    root: document.querySelector("[paste-safe]"),
    officialBaseLink: window.location.origin + "/"
});
//# sourceMappingURL=main.js.map