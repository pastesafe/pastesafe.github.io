/// <reference path="typings/tsd.d.ts"/>

// # The PasteSafe Module
// *Simple functions for encrypting and decrypting text via Web Crypto API.*

// - This pastesafe module is built on the *Web Crypto API* ([mdn](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), [w3c](https://www.w3.org/TR/WebCryptoAPI/)), and exposes two convenient functions: `encrypt` and `decrypt`.
// - This is the heart of the instant crypto web app: [**pastesafe.github.io**](https://pastesafe.github.io/).
// - See this project's [**GitHub page**](https://github.com/PasteSafe/pastesafe).

// [Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Crypto) object.
const crypto: Crypto = window.crypto || (<any>window).msCrypto;

// Default options for encryption and decryption.
const defaults: EncryptOptions & DecryptOptions & PrepareKeyOptions = {

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
export function encrypt({
    text,
    password,
    charset = defaults.charset,
    algorithm = defaults.algorithm,
    ivSize = defaults.ivSize
}: EncryptOptions): Promise<string> {
    try {

        // The web cryptography api requires binary input -- so we use TextEncoder ([mdn](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder/TextEncoder), [whatwg](https://encoding.spec.whatwg.org/#dom-textencoder-encoding)) to encode our string.
        // *This is why internet explorer isn't supported.*
        var binaryText = new TextEncoder(charset).encode(text);

        // Size of the [initialization vector](https://en.wikipedia.org/wiki/Initialization_vector).
        // The IV is random noise, which is used in every encryption to make it unique and unpredictable.
        var iv = <Uint8Array> crypto.getRandomValues(new Uint8Array(ivSize));

        var parameters = <CipherParameters> {name: algorithm, iv};
    }
    catch (error) {
        return Promise.reject<string>(error);
    }
    return Promise.resolve(password)
        .then(password => prepareKey(password))
        .then(binaryKey => <ArrayBuffer> crypto.subtle.encrypt(parameters, binaryKey, binaryText))
        .then((secret: ArrayBuffer) => {
            let secretView = new Uint8Array(secret);
            let binary = new ArrayBuffer(ivSize + secretView.byteLength);
            let binaryIv = new Uint8Array(binary, 0, ivSize);
            let binarySecret = new Uint8Array(binary, ivSize, secretView.byteLength);
            binaryIv.set(iv);
            binarySecret.set(secretView);
            return binary;
        })
        .then(hexify);
}

//
// ## Decrypt a hex string with a password
// Returns the clear text payload.
//
export function decrypt({
    hex,
    password,
    charset = defaults.charset,
    algorithm = defaults.algorithm,
    ivSize = defaults.ivSize
}: DecryptOptions): Promise<string> {
    try {
        var binary = unhexify(hex);
        var iv = new Uint8Array(binary, 0, ivSize);
        var secret = new Uint8Array(binary, ivSize, binary.byteLength - ivSize);
        var parameters: CipherParameters = {name: algorithm, iv};
    }
    catch (error) {
        return Promise.reject<string>(error);
    }
    return Promise.resolve(password)
        .then(password => prepareKey(password))
        .then(key => <ArrayBuffer> crypto.subtle.decrypt(parameters, key, secret))
        .then(text => new TextDecoder(charset).decode(new Uint8Array(text)));
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

// Convert a password string into a [`CryptoKey`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey).
function prepareKey(password: string): Promise<CryptoKey> {
    return crypto.subtle.digest(defaults.hashAlgorithm, new TextEncoder(defaults.charset).encode(password))
        .then(hash => <CryptoKey> crypto.subtle.importKey('raw', hash, defaults.algorithm, false, ['encrypt', 'decrypt']));
}

// TypeScript interfaces.
export interface PasteSafeOptions {
    password: string;
    charset?: string;
    algorithm?: string;
    ivSize?: number;
}

export interface EncryptOptions extends PasteSafeOptions { text: string; }
export interface DecryptOptions extends PasteSafeOptions { hex: string; }
interface PrepareKeyOptions extends PasteSafeOptions { hashAlgorithm: string; }

interface CipherParameters {
    name: string;
    iv: ArrayBuffer;
}