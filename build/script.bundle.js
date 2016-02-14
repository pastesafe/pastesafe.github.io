/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//
	// # PasteSafe web app.
	// This is all just late-night stream-of-consciousness programming right here.
	// TODO: Refactor all of this.
	//
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __webpack_require__(1)], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports, pastesafe) {
	    "use strict";
	    var officialBaseLink = "https://pastesafe.github.io/";
	    // Forcing HTTPS in production.
	    var production = /github\.io/i.test(window.location.host) || /pastesafe\.com/i.test(window.location.host);
	    if (production && !/https/i.test(window.location.protocol))
	        window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
	    // Obtaining references to PasteSafe DOM elements.
	    var root = document.querySelector('[paste-safe]');
	    var textInput = root.querySelector('.text-input');
	    var textOutput = root.querySelector('.text-output');
	    var passwordInput = root.querySelector('.key');
	    var passwordTooltip = root.querySelector('.passbox .tooltip');
	    var encryptButton = root.querySelector('.encrypt');
	    var decryptButton = root.querySelector('.decrypt');
	    var outputBlocker = root.querySelector('.output-blocker');
	    var bottomLink = root.querySelector('.bottom-link');
	    // Preventing bottom link from being normally clicked.
	    bottomLink.onclick = function (event) {
	        event.preventDefault;
	        return false;
	    };
	    // Hiding the word 'password' from the password input to avoid pesky password managers.
	    passwordInput.setAttribute("type", "password");
	    passwordInput.setAttribute("placeholder", "Password");
	    // Start focused on password box.
	    passwordInput.focus();
	    var setBottomLink = function (hex) {
	        if (hex) {
	            bottomLink.href = officialBaseLink + "#" + hex;
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
	                var password = passwordInput.value;
	                var text = textInput.value;
	                pastesafe.encrypt({ text: text, password: password })
	                    .then(function (hex) {
	                    textOutput.textContent = hex;
	                    setBottomLink(hex);
	                    return hex;
	                })
	                    .catch(function (error) {
	                    textOutput.textContent = "";
	                    setBottomLink();
	                })
	                    .then(function () { instantActionInProgress = false; });
	            }
	            else {
	                var password = passwordInput.value;
	                var hex = textInput.value;
	                pastesafe.decrypt({ hex: hex, password: password })
	                    .then(function (text) {
	                    textOutput.textContent = text;
	                    setBottomLink();
	                    return text;
	                })
	                    .catch(function (error) {
	                    textOutput.textContent = "";
	                    setBottomLink();
	                })
	                    .then(function () { instantActionInProgress = false; });
	            }
	        }
	        else {
	            textOutput.textContent = "";
	            setBottomLink();
	            instantActionInProgress = false;
	        }
	    }
	    // Bindings for instant action.
	    textInput.addEventListener('keyup', instantAction);
	    passwordInput.addEventListener('keyup', instantAction);
	    encryptButton.addEventListener('change', instantAction);
	    decryptButton.addEventListener('change', instantAction);
	    // Flyout toggle.
	    var baseplate = document.querySelector('.baseplate');
	    baseplate.setAttribute("data-flyout-state", window.localStorage.getItem("flyout") || "active");
	    function toggleHandler(event) {
	        var currentState = baseplate.getAttribute("data-flyout-state");
	        var newState = currentState === "active" ? "hidden" : "active";
	        baseplate.setAttribute("data-flyout-state", newState);
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	//# sourceMappingURL=script.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/// <reference path="typings/tsd.d.ts"/>
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
	    "use strict";
	    // # The PasteSafe Module
	    // *Simple functions for encrypting and decrypting text via Web Crypto API.*
	    // - This pastesafe module is built on the *Web Crypto API* ([mdn](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), [w3c](https://www.w3.org/TR/WebCryptoAPI/)), and exposes two convenient functions: `encrypt` and `decrypt`.
	    // - This is the heart of the instant crypto web app: [**pastesafe.github.io**](https://pastesafe.github.io/).
	    // - See this project's [**GitHub page**](https://github.com/PasteSafe/pastesafe).
	    // [Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Crypto) object.
	    var crypto = window.crypto || window.msCrypto;
	    // Default options for encryption and decryption.
	    var defaults = {
	        // Required defaults.
	        password: undefined,
	        text: undefined,
	        hex: undefined,
	        // Encrypt/decrypt defaults.
	        charset: 'utf-8',
	        algorithm: 'aes-gcm',
	        ivSize: 128,
	        // `prepareKey` defaults.
	        hashAlgorithm: 'sha-256'
	    };
	    //
	    // ## Encrypt some text with a password
	    // You'll get the encrypted contents back as a big hex string, I promise.
	    //
	    function encrypt(_a) {
	        var text = _a.text, password = _a.password, _b = _a.charset, charset = _b === void 0 ? defaults.charset : _b, _c = _a.algorithm, algorithm = _c === void 0 ? defaults.algorithm : _c, _d = _a.ivSize, ivSize = _d === void 0 ? defaults.ivSize : _d;
	        try {
	            // The web cryptography api requires binary input -- so we use TextEncoder ([mdn](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder/TextEncoder), [whatwg](https://encoding.spec.whatwg.org/#dom-textencoder-encoding)) to encode our string.
	            // *This is why internet explorer isn't supported.*
	            var binaryText = new TextEncoder(charset).encode(text);
	            // Size of the [initialization vector](https://en.wikipedia.org/wiki/Initialization_vector).
	            // The IV is random noise, which is used in every encryption to make it unique and unpredictable.
	            var iv = crypto.getRandomValues(new Uint8Array(ivSize));
	            var parameters = { name: algorithm, iv: iv };
	        }
	        catch (error) {
	            return Promise.reject(error);
	        }
	        return Promise.resolve(password)
	            .then(function (password) { return prepareKey(password); })
	            .then(function (binaryKey) { return crypto.subtle.encrypt(parameters, binaryKey, binaryText); })
	            .then(function (secret) {
	            var secretView = new Uint8Array(secret);
	            var binary = new ArrayBuffer(ivSize + secretView.byteLength);
	            var binaryIv = new Uint8Array(binary, 0, ivSize);
	            var binarySecret = new Uint8Array(binary, ivSize, secretView.byteLength);
	            binaryIv.set(iv);
	            binarySecret.set(secretView);
	            return binary;
	        })
	            .then(hexify);
	    }
	    exports.encrypt = encrypt;
	    //
	    // ## Decrypt a hex string with a password
	    // Returns the clear text payload.
	    //
	    function decrypt(_a) {
	        var hex = _a.hex, password = _a.password, _b = _a.charset, charset = _b === void 0 ? defaults.charset : _b, _c = _a.algorithm, algorithm = _c === void 0 ? defaults.algorithm : _c, _d = _a.ivSize, ivSize = _d === void 0 ? defaults.ivSize : _d;
	        try {
	            var binary = unhexify(hex);
	            var iv = new Uint8Array(binary, 0, ivSize);
	            var secret = new Uint8Array(binary, ivSize, binary.byteLength - ivSize);
	            var parameters = { name: algorithm, iv: iv };
	        }
	        catch (error) {
	            return Promise.reject(error);
	        }
	        return Promise.resolve(password)
	            .then(function (password) { return prepareKey(password); })
	            .then(function (key) { return crypto.subtle.decrypt(parameters, key, secret); })
	            .then(function (text) { return new TextDecoder(charset).decode(new Uint8Array(text)); });
	    }
	    exports.decrypt = decrypt;
	    // Convert binary to hex.
	    function hexify(buffer) {
	        return Array.from(new Uint8Array(buffer))
	            .map(function (byte) { return ('00' + byte.toString(16).toUpperCase()).slice(-2); })
	            .join('');
	    }
	    // Convert hex to binary.
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
	    // Convert a password string into a [`CryptoKey`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey).
	    function prepareKey(password) {
	        return crypto.subtle.digest(defaults.hashAlgorithm, new TextEncoder(defaults.charset).encode(password))
	            .then(function (hash) { return crypto.subtle.importKey('raw', hash, defaults.algorithm, false, ['encrypt', 'decrypt']); });
	    }
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	//# sourceMappingURL=pastesafe.js.map

/***/ }
/******/ ]);