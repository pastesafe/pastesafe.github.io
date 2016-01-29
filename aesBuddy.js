//// 
//// aesBuddy is a tool that provides simple functions for encrypting and decrypting text.
////
var aesBuddy = (function AesBuddy() { "use strict";
    var crypto = window.crypto || window.msCrypto;

    function hexify(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(byte => ('00' + byte.toString(16).toUpperCase()).slice(-2))
            .join('');
    }

    function unhexify(hex) {
        var bufferLength = hex.length / 2;
        var buffer = new ArrayBuffer(bufferLength);
        var view = new Uint8Array(buffer);
        for (var bufferIndex=0; bufferIndex<bufferLength; bufferIndex++) {
            var hexIndex = bufferIndex * 2;
            var hexByte = hex[hexIndex] + hex[hexIndex+1];
            view[bufferIndex] = parseInt(hexByte, 16);
        }
        return buffer;
    }

    function prepareKey(password) {
        return crypto.subtle.digest('sha-256', new TextEncoder('utf-8').encode(password))
            .then(hash => crypto.subtle.importKey('raw', hash, 'aes-gcm', false, ['encrypt', 'decrypt']));
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
            .then(key => crypto.subtle.encrypt({name: 'aes-gcm', iv: iv}, key, cleartext))
            .then(ciphertext => {
                ciphertext = new Uint8Array(ciphertext);
                var buffer = new ArrayBuffer(16 + ciphertext.byteLength);
                var ivView = new Uint8Array(buffer, 0, 16);
                var ciphertextView = new Uint8Array(buffer, 16, ciphertext.byteLength);
                ivView.set(iv);
                ciphertextView.set(ciphertext);
                return buffer;
            })
            .then(hexify);
    }

    function decrypt(password, hex) {
        try {
            var secret = unhexify(hex);
            var iv = new Uint8Array(secret, 0, 16);
            var ciphertext = new Uint8Array(secret, 16, secret.byteLength - 16);
        }
        catch (error) {
            return Promise.reject(error);
        }
        return prepareKey(password)
            .then(key => crypto.subtle.decrypt({name: 'aes-gcm', iv: iv}, key, ciphertext))
            .then(cleartext => new TextDecoder('utf-8').decode(cleartext));
    }

    return {
        encrypt:encrypt,
        decrypt:decrypt
    };
})();