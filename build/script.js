//
// # PasteSafe web app.
// This is all just late-night stream-of-consciousness programming right here.
// TODO: Refactor all of this.
//
define(["require", "exports", "./library/pastesafe/pastesafe"], function (require, exports, pastesafe) {
    "use strict";
    var officialBaseLink = "https://pastesafe.github.io/";
    // Forcing HTTPS in production.
    var production = /github\.io/i.test(window.location.host) || /pastesafe\.com/i.test(window.location.host);
    if (production && !/https/i.test(window.location.protocol))
        window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
    // Obtaining references to PasteSafe DOM elements.
    var root = document.querySelector('[paste-safe]');
    var textInput = root.querySelector('.text-input');
    var textOutput = root.querySelector('.text-output');
    var passwordInput = root.querySelector('.key');
    var passwordTooltip = root.querySelector('.passbox .tooltip');
    var encryptButton = root.querySelector('.encrypt');
    var decryptButton = root.querySelector('.decrypt');
    var outputBlocker = root.querySelector('.output-blocker');
    var bottomLink = root.querySelector('.bottom-link');
    // Preventing bottom link from being normally clicked.
    bottomLink.onclick = function (event) {
        event.preventDefault;
        return false;
    };
    // Hiding the word 'password' from the password input to avoid pesky password managers.
    passwordInput.setAttribute("type", "password");
    passwordInput.setAttribute("placeholder", "Password");
    // Start focused on password box.
    passwordInput.focus();
    var setBottomLink = function (hex) {
        if (hex) {
            bottomLink.href = officialBaseLink + "#" + hex;
            bottomLink.textContent = officialBaseLink + "#" + hex.substring(0, 8) + "...";
            bottomLink.setAttribute("data-show", "");
        }
        else {
            bottomLink.href = "#";
            bottomLink.textContent = "";
            bottomLink.removeAttribute("data-show");
        }
    };
    setBottomLink();
    var getCryptionMode = function () {
        var checkedRadioButton = root.querySelector('input[name=cryption_mode]:checked');
        return checkedRadioButton.value;
    };
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
    }
    encryptButton.addEventListener('change', refreshCryptionMode);
    decryptButton.addEventListener('change', refreshCryptionMode);
    refreshCryptionMode();
    function setCryptionMode(mode) {
        encryptButton.checked = (mode === 'encrypt') ? true : false;
        decryptButton.checked = (mode === 'decrypt') ? true : false;
        refreshCryptionMode();
    }
    // As-you-type instant (en|de)cryption.
    var instantActionInProgress = false;
    function instantAction() {
        if (instantActionInProgress)
            return;
        instantActionInProgress = true;
        passwordTooltip.removeAttribute("data-show");
        var cryptionMode = getCryptionMode();
        if (!!textInput.value && !!passwordInput.value) {
            if (cryptionMode === 'encrypt') {
                var password = passwordInput.value;
                var text = textInput.value;
                pastesafe.encrypt({ text: text, password: password })
                    .then(function (hex) {
                    textOutput.textContent = hex;
                    setBottomLink(hex);
                    return hex;
                })
                    .catch(function (error) {
                    textOutput.textContent = "";
                    setBottomLink();
                })
                    .then(function () { instantActionInProgress = false; });
            }
            else {
                var password = passwordInput.value;
                var hex = textInput.value;
                pastesafe.decrypt({ hex: hex, password: password })
                    .then(function (text) {
                    textOutput.textContent = text;
                    setBottomLink();
                    return text;
                })
                    .catch(function (error) {
                    textOutput.textContent = "";
                    setBottomLink();
                })
                    .then(function () { instantActionInProgress = false; });
            }
        }
        else {
            textOutput.textContent = "";
            setBottomLink();
            instantActionInProgress = false;
        }
    }
    // Bindings for instant action.
    textInput.addEventListener('keyup', instantAction);
    passwordInput.addEventListener('keyup', instantAction);
    encryptButton.addEventListener('change', instantAction);
    decryptButton.addEventListener('change', instantAction);
    // Flyout toggle.
    var baseplate = document.querySelector('.baseplate');
    baseplate.setAttribute("data-flyout-state", window.localStorage.getItem("flyout") || "active");
    function toggleHandler(event) {
        var currentState = baseplate.getAttribute("data-flyout-state");
        var newState = currentState === "active" ? "hidden" : "active";
        baseplate.setAttribute("data-flyout-state", newState);
        window.localStorage.setItem("flyout", newState);
        if (event)
            event.preventDefault();
        return false;
    }
    var toggleButtons = [].slice.call(document.querySelectorAll('.flyout-toggle-button'));
    for (var i = 0; i < toggleButtons.length; i++)
        toggleButtons[i].onclick = toggleHandler;
    // Initial instant action.
    instantAction();
    // Initializing with decryption data from URL.
    function interpretHash() {
        var hash = /(?:^|#)([0-9a-fA-f]{10,})/i.exec(window.location.hash);
        if (hash) {
            var hex = hash[1];
            textInput.value = hex;
            setCryptionMode('decrypt');
            passwordInput.focus();
            instantAction();
            passwordTooltip.setAttribute("data-show", "");
        }
        window.location.hash = ''; // Removing hash afterwards.
    }
    window.addEventListener('hashchange', interpretHash);
    interpretHash();
});
//# sourceMappingURL=script.js.map