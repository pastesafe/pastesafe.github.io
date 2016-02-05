/// <reference path="definitions/es6-shim.d.ts"/>
/// <reference path="definitions/text-encoding.d.ts"/>

////
//// aesBuddy is a module that provides simple functions for encrypting and decrypting text.
////
module aesBuddy {
    let crypto: Crypto = window.crypto || (<any>window).msCrypto;

    function hexify(buffer: ArrayBuffer): string {
        return Array.from(new Uint8Array(buffer))
            .map(byte => ('00' + byte.toString(16).toUpperCase()).slice(-2))
            .join('');
    }

    function unhexify(hex: string): ArrayBuffer {
        let bufferLength = hex.length / 2;
        let buffer = new ArrayBuffer(bufferLength);
        let view = new Uint8Array(buffer);
        for (let bufferIndex=0; bufferIndex<bufferLength; bufferIndex++) {
            let hexIndex = bufferIndex * 2;
            let hexByte = hex[hexIndex] + hex[hexIndex+1];
            view[bufferIndex] = parseInt(hexByte, 16);
        }
        return buffer;
    }

    function prepareKey(password): Promise<CryptoKey> {
        return crypto.subtle.digest('sha-256', new TextEncoder('utf-8').encode(password))
            .then(hash => <CryptoKey> crypto.subtle.importKey('raw', hash, 'aes-gcm', false, ['encrypt', 'decrypt']));
    }

    export function encrypt(password, text): Promise<string> {
        try {
            var iv = <Uint8Array> crypto.getRandomValues(new Uint8Array(16));
            var cleartext = new TextEncoder('utf-8').encode(text);
        }
        catch (error) {
            return Promise.reject<string>(error);
        }
        return prepareKey(password)
            .then(key => <ArrayBuffer> crypto.subtle.encrypt({name: 'aes-gcm', iv}, key, cleartext))
            .then((secret: ArrayBuffer) => {
                let secretView = new Uint8Array(secret);
                let binary = new ArrayBuffer(16 + secretView.byteLength);
                let binaryIv = new Uint8Array(binary, 0, 16);
                let binarySecret = new Uint8Array(binary, 16, secretView.byteLength);
                binaryIv.set(iv);
                binarySecret.set(secretView);
                return binary;
            })
            .then(hexify);
    };

    export function decrypt(password, hex): Promise<string> {
        try {
            var binary = unhexify(hex);
            var iv = new Uint8Array(binary, 0, 16);
            var secret = new Uint8Array(binary, 16, binary.byteLength - 16);
        }
        catch (error) {
            return Promise.reject<string>(error);
        }
        return prepareKey(password)
            .then(key => <ArrayBuffer> crypto.subtle.decrypt({name: 'aes-gcm', iv}, key, secret))
            .then(text => new TextDecoder('utf-8').decode(new Uint8Array(text)));
    };
}