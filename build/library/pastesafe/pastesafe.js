/// <reference path="typings/tsd.d.ts"/>
define(["require", "exports"], function (require, exports) {
    "use strict";
    //
    // # pastesafe
    // *Simple functions for encrypting and decrypting text.*
    //
    // Check out the Web Crypto API on MDN:
    //   > https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
    //
    // Crypto object
    //  > https://developer.mozilla.org/en-US/docs/Web/API/Crypto
    var crypto = window.crypto || window.msCrypto;
    /**
     * Encrypt some text with a password.
     * You'll get the encrypted contents back as a big hex string.
     */
    function encrypt(password, text) {
        try {
            var iv = crypto.getRandomValues(new Uint8Array(16));
            var cleartext = new TextEncoder('utf-8').encode(text);
            var algo = { name: 'aes-gcm', iv: iv };
        }
        catch (error) {
            return Promise.reject(error);
        }
        return prepareKey(password)
            .then(function (key) { return crypto.subtle.encrypt(algo, key, cleartext); })
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
    exports.encrypt = encrypt;
    /**
     * Decrypt a hex string with a password.
     * Returns the clear text payload.
     */
    function decrypt(password, hex) {
        try {
            var binary = unhexify(hex);
            var iv = new Uint8Array(binary, 0, 16);
            var secret = new Uint8Array(binary, 16, binary.byteLength - 16);
            var algo = { name: 'aes-gcm', iv: iv };
        }
        catch (error) {
            return Promise.reject(error);
        }
        return prepareKey(password)
            .then(function (key) { return crypto.subtle.decrypt(algo, key, secret); })
            .then(function (text) { return new TextDecoder('utf-8').decode(new Uint8Array(text)); });
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
    // Convert a password string into a `CryptoKey`.
    //  > https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey
    function prepareKey(password) {
        return crypto.subtle.digest('sha-256', new TextEncoder('utf-8').encode(password))
            .then(function (hash) { return crypto.subtle.importKey('raw', hash, 'aes-gcm', false, ['encrypt', 'decrypt']); });
    }
});
//# sourceMappingURL=pastesafe.js.map