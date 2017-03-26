"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pcrypto = require("pcrypto");
var PasteSafe = (function () {
    /**
     * Initialize the PasteSafe widget.
     *  - query for html elements under the root
     *  - bind some events
     *  - avoid password managers
     *  - start the bottom link empty
     */
    function PasteSafe(_a) {
        var root = _a.root, officialBaseLink = _a.officialBaseLink;
        var _this = this;
        /** Activity indicator, to prevent concurrent cryption actions (forcing one-at-a-time). */
        this.instantActionInProgress = false;
        this.officialBaseLink = officialBaseLink;
        // Querying for HTML elements under the provided root element.
        this.elements = {
            root: root,
            textInput: root.querySelector(".text-input"),
            textOutput: root.querySelector(".text-output"),
            passwordInput: root.querySelector(".key"),
            passwordTooltip: root.querySelector(".passbox .tooltip"),
            encryptButton: root.querySelector(".encrypt"),
            decryptButton: root.querySelector(".decrypt"),
            outputBlocker: root.querySelector(".output-blocker"),
            bottomLink: root.querySelector(".bottom-link")
        };
        // Preventing bottom link from being normally clicked.
        this.elements.bottomLink.onclick = function (event) {
            event.preventDefault;
            return false;
        };
        // Hiding the word 'password' from the password input to avoid pesky password managers.
        this.elements.passwordInput.setAttribute("type", "password");
        this.elements.passwordInput.setAttribute("placeholder", "Password");
        // Start focused on password box.
        this.elements.passwordInput.focus();
        // Start the bottom link empty.
        this.setBottomLink();
        // Event listeners for the cryption mode radio buttons.
        this.elements.encryptButton.addEventListener("change", function () { return _this.refreshCryptionMode(); });
        this.elements.decryptButton.addEventListener("change", function () { return _this.refreshCryptionMode(); });
        this.refreshCryptionMode();
        // Bindings for instant action.
        this.elements.textInput.addEventListener("keyup", function () { return _this.instantAction(); });
        this.elements.passwordInput.addEventListener("keyup", function () { return _this.instantAction(); });
        this.elements.encryptButton.addEventListener("change", function () { return _this.instantAction(); });
        this.elements.decryptButton.addEventListener("change", function () { return _this.instantAction(); });
        // Initializing with decryption data from URL.
        window.addEventListener("hashchange", function () { return _this.interpretHash(); });
        this.interpretHash();
        // Initial instant action.
        this.instantAction();
    }
    /**
     * Update the link at the bottom with fresh ciphertext.
     */
    PasteSafe.prototype.setBottomLink = function (ciphertext) {
        if (ciphertext) {
            this.elements.bottomLink.href = this.officialBaseLink + "#" + ciphertext;
            this.elements.bottomLink.textContent = this.officialBaseLink + "#" + ciphertext.substring(0, 8) + "...";
            this.elements.bottomLink.setAttribute("data-show", "");
        }
        else {
            this.elements.bottomLink.href = "#";
            this.elements.bottomLink.textContent = "";
            this.elements.bottomLink.removeAttribute("data-show");
        }
    };
    PasteSafe.prototype.getCryptionMode = function () {
        var checkedRadioButton = this.elements.root.querySelector("input[name=cryption_mode]:checked");
        return checkedRadioButton.value;
    };
    PasteSafe.prototype.refreshCryptionMode = function () {
        if (this.getCryptionMode() === "encrypt") {
            this.elements.root.setAttribute("data-cryption-mode", "encrypt");
            this.elements.decryptButton.parentElement.removeAttribute("data-checked");
            this.elements.encryptButton.parentElement.setAttribute("data-checked", "");
        }
        else {
            this.elements.root.setAttribute("data-cryption-mode", "decrypt");
            this.elements.encryptButton.parentElement.removeAttribute("data-checked");
            this.elements.decryptButton.parentElement.setAttribute("data-checked", "");
        }
    };
    PasteSafe.prototype.setCryptionMode = function (mode) {
        this.elements.encryptButton.checked = (mode === "encrypt") ? true : false;
        this.elements.decryptButton.checked = (mode === "decrypt") ? true : false;
        this.refreshCryptionMode();
    };
    PasteSafe.prototype.instantAction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cryptionMode, password, plaintext, ciphertext, error_1, password, ciphertext, plaintext, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.instantActionInProgress)
                            return [2 /*return*/];
                        this.instantActionInProgress = true;
                        this.elements.passwordTooltip.removeAttribute("data-show");
                        cryptionMode = this.getCryptionMode();
                        if (!(!!this.elements.textInput.value && !!this.elements.passwordInput.value)) return [3 /*break*/, 11];
                        if (!(cryptionMode === "encrypt")) return [3 /*break*/, 5];
                        password = this.elements.passwordInput.value;
                        plaintext = this.elements.textInput.value;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, pcrypto.encrypt({ password: password, plaintext: plaintext })];
                    case 2:
                        ciphertext = _a.sent();
                        this.elements.textOutput.textContent = ciphertext;
                        this.setBottomLink(ciphertext);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.elements.textOutput.textContent = "";
                        this.setBottomLink();
                        return [3 /*break*/, 4];
                    case 4:
                        this.instantActionInProgress = false;
                        return [3 /*break*/, 10];
                    case 5:
                        password = this.elements.passwordInput.value;
                        ciphertext = this.elements.textInput.value;
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, pcrypto.decrypt({ password: password, ciphertext: ciphertext })];
                    case 7:
                        plaintext = _a.sent();
                        this.elements.textOutput.textContent = plaintext;
                        return [3 /*break*/, 9];
                    case 8:
                        error_2 = _a.sent();
                        this.elements.textOutput.textContent = "";
                        return [3 /*break*/, 9];
                    case 9:
                        this.setBottomLink();
                        this.instantActionInProgress = false;
                        _a.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        this.elements.textOutput.textContent = "";
                        this.setBottomLink();
                        this.instantActionInProgress = false;
                        _a.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    PasteSafe.prototype.interpretHash = function () {
        var hash = /(?:^|#)([0-9a-fA-f]{10,})/i.exec(window.location.hash);
        if (hash) {
            var hex = hash[1];
            this.elements.textInput.value = hex;
            this.setCryptionMode("decrypt");
            this.elements.passwordInput.focus();
            this.instantAction();
            this.elements.passwordTooltip.setAttribute("data-show", "");
        }
        window.location.hash = ""; // Removing hash afterwards.
    };
    return PasteSafe;
}());
exports.default = PasteSafe;
//# sourceMappingURL=PasteSafe.js.map