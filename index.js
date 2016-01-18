//// 
//// 'aesBuddy' tool provides simple functions for encrypting and decrypting text.
////
var aesBuddy = (function AesBuddy() { "use strict";
    var crypto = window.crypto || window.msCrypto;

    function hexify(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(byte => ('00' + byte.toString(16).toUpperCase()).slice(-2))
            .join('');
    };

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
    };

    function prepareKey(password) {
        return crypto.subtle.digest('sha-256', new TextEncoder('utf-8').encode(password))
            .then(hash => crypto.subtle.importKey('raw', hash, 'aes-gcm', false, ['encrypt', 'decrypt']));
    };

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
    };

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
    };

    return {
        encrypt:encrypt,
        decrypt:decrypt
    };
})();


////
//// PasteSafe Web App
////
(function PasteSafeWebApp(aesBuddy) { "use strict";

    // Forcing HTTPS in production.
    var production = /github\.io/i.test(window.location.href) || /pastesafe\.com/i.test(window.location.href);
    if (production && !/https/i.test(window.location.protocol))
        window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
    
    var root = document.querySelector('[paste-safe]');
    var textInput = root.querySelector('textarea.text-input');
    var textOutput = root.querySelector('textarea.text-output');
    var passwordInput = root.querySelector('input.password');
    var encryptButton = root.querySelector('.encrypt');
    var decryptButton = root.querySelector('.decrypt');
    var outputBlocker = root.querySelector('.output-blocker');
    var getCryptionMode = () => root.querySelector('input[name="cryption_mode"]:checked').value;

    // Handling the switch between 'encrypt' and 'decrypt' cryption mode.
    (()=>{
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
        };
        encryptButton.addEventListener('change', refreshCryptionMode);
        decryptButton.addEventListener('change', refreshCryptionMode);
        refreshCryptionMode();

    })();
    
    var operation = 0;

    function engageEncrypt() {
        var op = ++operation;
        return aesBuddy.encrypt(passwordInput.value, textInput.value)
            .then(hex => {
                if (op >= operation) textOutput.value = hex;
                return hex;
            });
    };

    function engageDecrypt() {
        var op = ++operation;
        return aesBuddy.decrypt(passwordInput.value, textInput.value)
            .then(text => {
                if (op >= operation) textOutput.value = text;
                return text;
            });
    };

    function setOutputBlocker(options) {
        var mode = options.mode || "off";
        var list = options.list || [];
        outputBlocker.setAttribute("data-mode", mode);
        outputBlocker.innerHTML = "";
        list.forEach(item => {
            var li = document.createElement('li');
            li.textContent = item;
            outputBlocker.appendChild(li);
        });
    };

    function instantAction() {
        var cryptionMode = getCryptionMode();
        if (!!textInput.value && !!passwordInput.value) {
            if (cryptionMode === 'encrypt')
                engageEncrypt()
                    .then(hex => {
                        setOutputBlocker({mode: "off", list: []});
                    })
                    .catch(error => {
                        textOutput.value = "";
                        setOutputBlocker({mode: "error", list: ["encryption error"]});
                    });
            else 
                engageDecrypt()
                    .then(text => {
                        setOutputBlocker({mode: "off", list: []});
                    })
                    .catch(error => {
                        textOutput.value = "";
                        setOutputBlocker({mode: "error", list: ["invalid"]});
                    });
        }
        else {
            textOutput.value = "";
            setOutputBlocker({mode: "plain", list: ["input and password required"]});
        }
    };

    textInput.addEventListener('keyup', instantAction);
    passwordInput.addEventListener('keyup', instantAction);
    encryptButton.addEventListener('change', instantAction);
    decryptButton.addEventListener('change', instantAction);
    setOutputBlocker({mode: "plain", list: ["input and password required"]});
})(aesBuddy);