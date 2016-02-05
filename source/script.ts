/// <reference path="./aesBuddy.ts"/>

////
//// PasteSafe web app.
////

var officialBaseLink = "https://pastesafe.github.io/";

// Forcing HTTPS in production.
var production = /github\.io/i.test(window.location.host) || /pastesafe\.com/i.test(window.location.host);
if (production && !/https/i.test(window.location.protocol))
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);

// Obtaining references to PasteSafe DOM elements.
var root            = <HTMLElement>         document.querySelector('[paste-safe]');
var textInput       = <HTMLTextAreaElement> root.querySelector('.text-input');
var textOutput      = <HTMLTextAreaElement> root.querySelector('.text-output');
var passwordInput   = <HTMLInputElement>    root.querySelector('.password');
var passwordTooltip = <HTMLDivElement>      root.querySelector('.passbox .tooltip');
var encryptButton   = <HTMLInputElement>    root.querySelector('.encrypt');
var decryptButton   = <HTMLInputElement>    root.querySelector('.decrypt');
var outputBlocker   = <HTMLTextAreaElement> root.querySelector('.output-blocker');
var bottomLink      = <HTMLAnchorElement>   root.querySelector('.bottom-link');

// Start focused on password box.
passwordInput.focus();

var setBottomLink = (hex?: string) => {
    if (hex) {
        bottomLink.href = "#" + hex;
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

var getCryptionMode = () => {
    let checkedRadioButton = <HTMLInputElement> root.querySelector('input[name=cryption_mode]:checked');
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
    encryptButton.checked = (mode==='encrypt') ?true :false;
    decryptButton.checked = (mode==='decrypt') ?true :false;
    refreshCryptionMode();
}

// Blocking the output textarea with a message.
// Modes:
//  - off: no output blocker.
//  - plain: subtle blocker with a simple message.
//  - error: angry blocker that indicates something went wrong.
function setOutputBlocker(options) {
    return false;
    var mode = options.mode || "off";
    var list = options.list || [];
    outputBlocker.setAttribute("data-mode", mode);
    outputBlocker.innerHTML = "";
    list.forEach(item => {
        var li = document.createElement('li');
        li.textContent = item;
        outputBlocker.appendChild(li);
    });
}

// As-you-type instant (en|de)cryption.
var instantActionInProgress = false;
function instantAction() {
    if (instantActionInProgress) return;
    instantActionInProgress = true;

    passwordTooltip.removeAttribute("data-show");

    var cryptionMode = getCryptionMode();

    if (!!textInput.value && !!passwordInput.value) {
        if (cryptionMode === 'encrypt') {
            aesBuddy.encrypt(passwordInput.value, textInput.value)
                .then(hex => {
                    textOutput.textContent = hex;
                    setBottomLink(hex);
                    return hex;
                })
                .then(hex => { setOutputBlocker({mode: "off", list: []}); })
                .catch(error => {
                    textOutput.textContent = "";
                    setBottomLink();
                    setOutputBlocker({mode: "error", list: ["encryption error"]});
                })
                .then(()=>{ instantActionInProgress = false; });
        }
        else {
            aesBuddy.decrypt(passwordInput.value, textInput.value)
                .then(text => {
                    textOutput.textContent = text;
                    setBottomLink();
                    return text;
                })
                .then(text => { setOutputBlocker({mode: "off", list: []}) })
                .catch(error => {
                    textOutput.textContent = "";
                    setBottomLink();
                    setOutputBlocker({mode: "error", list: ["invalid"]});
                })
                .then(()=>{ instantActionInProgress = false; });
        }
    }
    else {
        textOutput.textContent = "";
        setBottomLink();
        setOutputBlocker({mode: "plain", list: ["enter some input text and a password above"]});
        instantActionInProgress = false;
    }
}

// Bindings for instant action.
textInput.addEventListener('keyup', instantAction);
passwordInput.addEventListener('keyup', instantAction);
encryptButton.addEventListener('change', instantAction);
decryptButton.addEventListener('change', instantAction);

// Flyout toggle.
var plate = document.querySelector('.plate');
plate.setAttribute("data-flyout-state", window.localStorage.getItem("flyout") || "active");
function toggleHandler(event) {
    var currentState = plate.getAttribute("data-flyout-state");
    var newState = currentState==="active" ?"hidden" :"active";
    plate.setAttribute("data-flyout-state", newState);
    window.localStorage.setItem("flyout", newState);
    if (event) event.preventDefault();
    return false;
}
var toggleButtons = <HTMLElement[]> [].slice.call( document.querySelectorAll('.flyout-toggle-button') );
for (var i=0; i<toggleButtons.length; i++)
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