/// <reference path="typings/tsd.d.ts" />
export declare function encrypt({text, password, charset, algorithm, ivSize}: EncryptOptions): Promise<string>;
export declare function decrypt({hex, password, charset, algorithm, ivSize}: DecryptOptions): Promise<string>;
export interface PasteSafeOptions {
    password: string;
    charset?: string;
    algorithm?: string;
    ivSize?: number;
}
export interface EncryptOptions extends PasteSafeOptions {
    text: string;
}
export interface DecryptOptions extends PasteSafeOptions {
    hex: string;
}
