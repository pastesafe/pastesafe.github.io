/// <reference path="typings/tsd.d.ts" />
/**
 * Encrypt some text with a password.
 * You'll get the encrypted contents back as a big hex string.
 */
export declare function encrypt(password: string, text: string): Promise<string>;
/**
 * Decrypt a hex string with a password.
 * Returns the clear text payload.
 */
export declare function decrypt(password: string, hex: string): Promise<string>;
