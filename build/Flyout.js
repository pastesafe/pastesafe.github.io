"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Flyout = (function () {
    function Flyout(_a) {
        var baseplate = _a.baseplate, toggleButtons = _a.toggleButtons;
        var _this = this;
        this.baseplate = baseplate;
        this.toggleButtons = toggleButtons;
        this.baseplate.setAttribute("data-flyout-state", window.localStorage.getItem("flyout") || "active");
        this.toggleButtons.forEach(function (toggle) { return toggle.onclick = function (event) { return _this.toggleHandler(event); }; });
    }
    Flyout.prototype.toggleHandler = function (event) {
        var currentState = this.baseplate.getAttribute("data-flyout-state");
        var newState = currentState === "active" ? "hidden" : "active";
        this.baseplate.setAttribute("data-flyout-state", newState);
        window.localStorage.setItem("flyout", newState);
        if (event) {
            event.preventDefault();
            return false;
        }
    };
    return Flyout;
}());
exports.default = Flyout;
//# sourceMappingURL=Flyout.js.map