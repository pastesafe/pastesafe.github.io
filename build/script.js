/// <reference path="definitions/es6-shim.d.ts"/>
/// <reference path="definitions/text-encoding.d.ts"/>
////
//// aesBuddy is a module that provides simple functions for encrypting and decrypting text.
////
var aesBuddy;
(function (aesBuddy) {
    var crypto = window.crypto || window.msCrypto;
    function hexify(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(function (byte) { return ('00' + byte.toString(16).toUpperCase()).slice(-2); })
            .join('');
    }
    function unhexify(hex) {
        var bufferLength = hex.length / 2;
        var buffer = new ArrayBuffer(bufferLength);
        var view = new Uint8Array(buffer);
        for (var bufferIndex = 0; bufferIndex < bufferLength; bufferIndex++) {
            var hexIndex = bufferIndex * 2;
            var hexByte = hex[hexIndex] + hex[hexIndex + 1];
            view[bufferIndex] = parseInt(hexByte, 16);
        }
        return buffer;
    }
    function prepareKey(password) {
        return crypto.subtle.digest('sha-256', new TextEncoder('utf-8').encode(password))
            .then(function (hash) { return crypto.subtle.importKey('raw', hash, 'aes-gcm', false, ['encrypt', 'decrypt']); });
    }
    function encrypt(password, text) {
        try {
            var iv = crypto.getRandomValues(new Uint8Array(16));
            var cleartext = new TextEncoder('utf-8').encode(text);
        }
        catch (error) {
            return Promise.reject(error);
        }
        return prepareKey(password)
            .then(function (key) { return crypto.subtle.encrypt({ name: 'aes-gcm', iv: iv }, key, cleartext); })
            .then(function (secret) {
            var secretView = new Uint8Array(secret);
            var binary = new ArrayBuffer(16 + secretView.byteLength);
            var binaryIv = new Uint8Array(binary, 0, 16);
            var binarySecret = new Uint8Array(binary, 16, secretView.byteLength);
            binaryIv.set(iv);
            binarySecret.set(secretView);
            return binary;
        })
            .then(hexify);
    }
    aesBuddy.encrypt = encrypt;
    ;
    function decrypt(password, hex) {
        try {
            var binary = unhexify(hex);
            var iv = new Uint8Array(binary, 0, 16);
            var secret = new Uint8Array(binary, 16, binary.byteLength - 16);
        }
        catch (error) {
            return Promise.reject(error);
        }
        return prepareKey(password)
            .then(function (key) { return crypto.subtle.decrypt({ name: 'aes-gcm', iv: iv }, key, secret); })
            .then(function (text) { return new TextDecoder('utf-8').decode(new Uint8Array(text)); });
    }
    aesBuddy.decrypt = decrypt;
    ;
})(aesBuddy || (aesBuddy = {}));
/// <reference path="./aesBuddy.ts"/>
////
//// PasteSafe web app.
////
var officialBaseLink = "https://pastesafe.github.io/";
// Forcing HTTPS in production.
var production = /github\.io/i.test(window.location.host) || /pastesafe\.com/i.test(window.location.host);
if (production && !/https/i.test(window.location.protocol))
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
// Obtaining references to PasteSafe DOM elements.
var root = document.querySelector('[paste-safe]');
var textInput = root.querySelector('.text-input');
var textOutput = root.querySelector('.text-output');
var passwordInput = root.querySelector('.password');
var passwordTooltip = root.querySelector('.passbox .tooltip');
var encryptButton = root.querySelector('.encrypt');
var decryptButton = root.querySelector('.decrypt');
var outputBlocker = root.querySelector('.output-blocker');
var bottomLink = root.querySelector('.bottom-link');
// Start focused on password box.
passwordInput.focus();
var setBottomLink = function (hex) {
    if (hex) {
        bottomLink.href = "#" + hex;
        bottomLink.textContent = officialBaseLink + "#" + hex.substring(0, 8) + "...";
        bottomLink.setAttribute("data-show", "");
    }
    else {
        bottomLink.href = "#";
        bottomLink.textContent = "";
        bottomLink.removeAttribute("data-show");
    }
};
setBottomLink();
var getCryptionMode = function () {
    var checkedRadioButton = root.querySelector('input[name=cryption_mode]:checked');
    return checkedRadioButton.value;
};
// Handling the switch between 'encrypt' and 'decrypt' cryption mode.
function refreshCryptionMode() {
    var cryptionMode = getCryptionMode();
    if (cryptionMode === 'encrypt') {
        root.setAttribute('data-cryption-mode', 'encrypt');
        decryptButton.parentElement.removeAttribute('data-checked');
        encryptButton.parentElement.setAttribute('data-checked', '');
    }
    else {
        root.setAttribute('data-cryption-mode', 'decrypt');
        encryptButton.parentElement.removeAttribute('data-checked');
        decryptButton.parentElement.setAttribute('data-checked', '');
    }
}
encryptButton.addEventListener('change', refreshCryptionMode);
decryptButton.addEventListener('change', refreshCryptionMode);
refreshCryptionMode();
function setCryptionMode(mode) {
    encryptButton.checked = (mode === 'encrypt') ? true : false;
    decryptButton.checked = (mode === 'decrypt') ? true : false;
    refreshCryptionMode();
}
// Blocking the output textarea with a message.
// Modes:
//  - off: no output blocker.
//  - plain: subtle blocker with a simple message.
//  - error: angry blocker that indicates something went wrong.
function setOutputBlocker(options) {
    return false;
    var mode = options.mode || "off";
    var list = options.list || [];
    outputBlocker.setAttribute("data-mode", mode);
    outputBlocker.innerHTML = "";
    list.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        outputBlocker.appendChild(li);
    });
}
// As-you-type instant (en|de)cryption.
var instantActionInProgress = false;
function instantAction() {
    if (instantActionInProgress)
        return;
    instantActionInProgress = true;
    passwordTooltip.removeAttribute("data-show");
    var cryptionMode = getCryptionMode();
    if (!!textInput.value && !!passwordInput.value) {
        if (cryptionMode === 'encrypt') {
            aesBuddy.encrypt(passwordInput.value, textInput.value)
                .then(function (hex) {
                textOutput.textContent = hex;
                setBottomLink(hex);
                return hex;
            })
                .then(function (hex) { setOutputBlocker({ mode: "off", list: [] }); })
                .catch(function (error) {
                textOutput.textContent = "";
                setBottomLink();
                setOutputBlocker({ mode: "error", list: ["encryption error"] });
            })
                .then(function () { instantActionInProgress = false; });
        }
        else {
            aesBuddy.decrypt(passwordInput.value, textInput.value)
                .then(function (text) {
                textOutput.textContent = text;
                setBottomLink();
                return text;
            })
                .then(function (text) { setOutputBlocker({ mode: "off", list: [] }); })
                .catch(function (error) {
                textOutput.textContent = "";
                setBottomLink();
                setOutputBlocker({ mode: "error", list: ["invalid"] });
            })
                .then(function () { instantActionInProgress = false; });
        }
    }
    else {
        textOutput.textContent = "";
        setBottomLink();
        setOutputBlocker({ mode: "plain", list: ["enter some input text and a password above"] });
        instantActionInProgress = false;
    }
}
// Bindings for instant action.
textInput.addEventListener('keyup', instantAction);
passwordInput.addEventListener('keyup', instantAction);
encryptButton.addEventListener('change', instantAction);
decryptButton.addEventListener('change', instantAction);
// Flyout toggle.
var plate = document.querySelector('.plate');
plate.setAttribute("data-flyout-state", window.localStorage.getItem("flyout") || "active");
function toggleHandler(event) {
    var currentState = plate.getAttribute("data-flyout-state");
    var newState = currentState === "active" ? "hidden" : "active";
    plate.setAttribute("data-flyout-state", newState);
    window.localStorage.setItem("flyout", newState);
    if (event)
        event.preventDefault();
    return false;
}
var toggleButtons = [].slice.call(document.querySelectorAll('.flyout-toggle-button'));
for (var i = 0; i < toggleButtons.length; i++)
    toggleButtons[i].onclick = toggleHandler;
// Initial instant action.
instantAction();
// Initializing with decryption data from URL.
function interpretHash() {
    var hash = /(?:^|#)([0-9a-fA-f]{10,})/i.exec(window.location.hash);
    if (hash) {
        var hex = hash[1];
        textInput.value = hex;
        setCryptionMode('decrypt');
        passwordInput.focus();
        instantAction();
        passwordTooltip.setAttribute("data-show", "");
    }
    window.location.hash = ''; // Removing hash afterwards.
}
window.addEventListener('hashchange', interpretHash);
interpretHash();
//# sourceMappingURL=script.js.map