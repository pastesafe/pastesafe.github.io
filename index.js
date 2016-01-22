////
//// PasteSafe web app.
////
(function PasteSafeWebApp(aesBuddy) { "use strict";
    // Forcing HTTPS in production.
    var production = /github\.io/i.test(window.location.href) || /pastesafe\.com/i.test(window.location.href);
    if (production && !/https/i.test(window.location.protocol))
        window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);

    // Obtaining references to PasteSafe DOM elements.
    var root = document.querySelector('[paste-safe]');
    var textInput = root.querySelector('textarea.text-input');
    var textOutput = root.querySelector('textarea.text-output');
    var passwordInput = root.querySelector('input.password');
    var encryptButton = root.querySelector('.encrypt');
    var decryptButton = root.querySelector('.decrypt');
    var outputBlocker = root.querySelector('.output-blocker');
    var getCryptionMode = () => root.querySelector('input[name="cryption_mode"]:checked').value;

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
    };
    encryptButton.addEventListener('change', refreshCryptionMode);
    decryptButton.addEventListener('change', refreshCryptionMode);
    refreshCryptionMode();

    // Blocking the output textarea with a message.
    // Modes:
    //  - off: no output blocker.
    //  - plain: subtle blocker with a simple message.
    //  - error: angry blocker that indicates something went wrong.
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

    // As-you-type instant (en|de)cryption.
    var instantActionInProgress = false;
    function instantAction() {
        if (instantActionInProgress) return;
        instantActionInProgress = true;

        var cryptionMode = getCryptionMode();

        if (!!textInput.value && !!passwordInput.value) {
            if (cryptionMode === 'encrypt') {
                aesBuddy.encrypt(passwordInput.value, textInput.value)
                    .then(hex => {
                        textOutput.value = hex;
                        return hex;
                    })
                    .then(hex => { setOutputBlocker({mode: "off", list: []}); })
                    .catch(error => {
                        textOutput.value = "";
                        setOutputBlocker({mode: "error", list: ["encryption error"]});
                    })
                    .then(()=>{ instantActionInProgress = false; });
            }
            else {
                aesBuddy.decrypt(passwordInput.value, textInput.value)
                    .then(text => {
                        textOutput.value = text;
                        return text;
                    })
                    .then(text => { setOutputBlocker({mode: "off", list: []}) })
                    .catch(error => {
                        textOutput.value = "";
                        setOutputBlocker({mode: "error", list: ["invalid"]});
                    })
                    .then(()=>{ instantActionInProgress = false; });
            }
        }
        else {
            textOutput.value = "";
            setOutputBlocker({mode: "plain", list: ["enter some input text and a password above"]});
            instantActionInProgress = false;
        }
    };

    // Bindings for instant action.
    textInput.addEventListener('keyup', instantAction);
    passwordInput.addEventListener('keyup', instantAction);
    encryptButton.addEventListener('change', instantAction);
    decryptButton.addEventListener('change', instantAction);

    // Initialize.
    instantAction();
})(aesBuddy);