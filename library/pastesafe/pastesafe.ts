/// <reference path="typings/tsd.d.ts"/>

//
// # pastesafe
// *Simple functions for encrypting and decrypting text.*
//
// Check out the Web Crypto API on MDN:
//   > https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
//

// Crypto object
//  > https://developer.mozilla.org/en-US/docs/Web/API/Crypto
const crypto: Crypto = window.crypto || (<any>window).msCrypto;

/**
 * Encrypt some text with a password.
 * You'll get the encrypted contents back as a big hex string.
 */
export function encrypt(password: string, text: string): Promise<string> {
    try {
        var iv = <Uint8Array> crypto.getRandomValues(new Uint8Array(16));
        var cleartext = new TextEncoder('utf-8').encode(text);
        var algo: Algorithm = {name: 'aes-gcm', iv};
    }
    catch (error) {
        return Promise.reject<string>(error);
    }
    return prepareKey(password)
        .then(key => <ArrayBuffer> crypto.subtle.encrypt(algo, key, cleartext))
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
}

/**
 * Decrypt a hex string with a password.
 * Returns the clear text payload.
 */
export function decrypt(password: string, hex: string): Promise<string> {
    try {
        var binary = unhexify(hex);
        var iv = new Uint8Array(binary, 0, 16);
        var secret = new Uint8Array(binary, 16, binary.byteLength - 16);
        var algo: Algorithm = {name: 'aes-gcm', iv};
    }
    catch (error) {
        return Promise.reject<string>(error);
    }
    return prepareKey(password)
        .then(key => <ArrayBuffer> crypto.subtle.decrypt(algo, key, secret))
        .then(text => new TextDecoder('utf-8').decode(new Uint8Array(text)));
}

// Convert binary to hex.
function hexify(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(byte => ('00' + byte.toString(16).toUpperCase()).slice(-2))
        .join('');
}

// Convert hex to binary.
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

// Convert a password string into a `CryptoKey`.
//  > https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey
function prepareKey(password: string): Promise<CryptoKey> {
    return crypto.subtle.digest('sha-256', new TextEncoder('utf-8').encode(password))
        .then(hash => <CryptoKey> crypto.subtle.importKey('raw', hash, 'aes-gcm', false, ['encrypt', 'decrypt']));
}

/** Definition patch for web crypto. */
interface Algorithm {
    name: string;
    iv: ArrayBuffer;
}