// # The PasteSafe Module
// *Simple functions for encrypting and decrypting text via Web Crypto API.*
define(["require", "exports"], function (require, exports) {
    "use strict";
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
});
//# sourceMappingURL=pastesafe.js.map