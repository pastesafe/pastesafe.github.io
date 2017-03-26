
const officialBaseLink = "https://pastesafe.github.io/"

import * as pcrypto from "pcrypto"

export interface PasteSafeOptions {
  root: HTMLElement
}

export default class PasteSafe {

  /** HTML element references. */
  elements: {
    root:            HTMLElement
    textInput:       HTMLTextAreaElement
    textOutput:      HTMLTextAreaElement
    passwordInput:   HTMLInputElement
    passwordTooltip: HTMLDivElement
    encryptButton:   HTMLInputElement
    decryptButton:   HTMLInputElement
    outputBlocker:   HTMLTextAreaElement
    bottomLink:      HTMLAnchorElement
  }

  /** Activity indicator, to prevent concurrent cryption actions (forcing one-at-a-time). */
  instantActionInProgress: boolean = false

  /**
   * Initialize the PasteSafe widget.
   *  - query for html elements under the root
   *  - bind some events
   *  - avoid password managers
   *  - start the bottom link empty
   */
  constructor({root}: PasteSafeOptions) {

    // Querying for HTML elements under the provided root element.
    this.elements = {
      root,
      textInput:       <HTMLTextAreaElement> root.querySelector(".text-input"),
      textOutput:      <HTMLTextAreaElement> root.querySelector(".text-output"),
      passwordInput:   <HTMLInputElement>    root.querySelector(".key"),
      passwordTooltip: <HTMLDivElement>      root.querySelector(".passbox .tooltip"),
      encryptButton:   <HTMLInputElement>    root.querySelector(".encrypt"),
      decryptButton:   <HTMLInputElement>    root.querySelector(".decrypt"),
      outputBlocker:   <HTMLTextAreaElement> root.querySelector(".output-blocker"),
      bottomLink:      <HTMLAnchorElement>   root.querySelector(".bottom-link")
    }

    // Preventing bottom link from being normally clicked.
    this.elements.bottomLink.onclick = function(event) {
        event.preventDefault
        return false
    }

    // Hiding the word 'password' from the password input to avoid pesky password managers.
    this.elements.passwordInput.setAttribute("type", "password")
    this.elements.passwordInput.setAttribute("placeholder", "Password")

    // Start focused on password box.
    this.elements.passwordInput.focus()

    // Start the bottom link empty.
    this.setBottomLink()

    // Event listeners for the cryption mode radio buttons.
    this.elements.encryptButton.addEventListener("change", () => this.refreshCryptionMode())
    this.elements.decryptButton.addEventListener("change", () => this.refreshCryptionMode())
    this.refreshCryptionMode()

    // Bindings for instant action.
    this.elements.textInput.addEventListener("keyup", () => this.instantAction())
    this.elements.passwordInput.addEventListener("keyup", () => this.instantAction())
    this.elements.encryptButton.addEventListener("change", () => this.instantAction())
    this.elements.decryptButton.addEventListener("change", () => this.instantAction())

    // Initializing with decryption data from URL.
    window.addEventListener("hashchange", () => this.interpretHash())
    this.interpretHash()

    // Initial instant action.
    this.instantAction()
  }

  /**
   * Update the link at the bottom with fresh ciphertext.
   */
  private setBottomLink(ciphertext?: string) {
    if (ciphertext) {
        this.elements.bottomLink.href = officialBaseLink + "#" + ciphertext
        this.elements.bottomLink.textContent = officialBaseLink + "#" + ciphertext.substring(0, 8) + "..."
        this.elements.bottomLink.setAttribute("data-show", "")
    }
    else {
        this.elements.bottomLink.href = "#"
        this.elements.bottomLink.textContent = ""
        this.elements.bottomLink.removeAttribute("data-show")
    }
  }

  private getCryptionMode() {
    const checkedRadioButton = <HTMLInputElement> this.elements.root.querySelector("input[name=cryption_mode]:checked")
    return checkedRadioButton.value
  }

  private refreshCryptionMode() {
    if (this.getCryptionMode() === "encrypt") {
        this.elements.root.setAttribute("data-cryption-mode", "encrypt")
        this.elements.decryptButton.parentElement.removeAttribute("data-checked")
        this.elements.encryptButton.parentElement.setAttribute("data-checked", "")
    }
    else {
        this.elements.root.setAttribute("data-cryption-mode", "decrypt")
        this.elements.encryptButton.parentElement.removeAttribute("data-checked")
        this.elements.decryptButton.parentElement.setAttribute("data-checked", "")
    }
  }

  private setCryptionMode(mode) {
    this.elements.encryptButton.checked = (mode==="encrypt") ? true : false;
    this.elements.decryptButton.checked = (mode==="decrypt") ? true : false;
    this.refreshCryptionMode();
  }

  private async instantAction() {
    if (this.instantActionInProgress) return
    this.instantActionInProgress = true

    this.elements.passwordTooltip.removeAttribute("data-show")

    const cryptionMode = this.getCryptionMode()

    if (!!this.elements.textInput.value && !!this.elements.passwordInput.value) {

        // Perform encryption.
        if (cryptionMode === "encrypt") {
            const password = this.elements.passwordInput.value
            const plaintext = this.elements.textInput.value
            try {
              const ciphertext = await pcrypto.encrypt({password, plaintext})
              this.elements.textOutput.textContent = ciphertext
              this.setBottomLink(ciphertext)
            }
            catch (error) {
              this.elements.textOutput.textContent = ""
              this.setBottomLink()
            }
            this.instantActionInProgress = false
        }

        // Perform decryption.
        else {
            const password = this.elements.passwordInput.value
            const ciphertext = this.elements.textInput.value
            try {
              const plaintext = await pcrypto.decrypt({password, ciphertext})
              this.elements.textOutput.textContent = plaintext
            }
            catch (error) {
              this.elements.textOutput.textContent = ""
            }
            this.setBottomLink()
            this.instantActionInProgress = false
        }
    }
    else {
        this.elements.textOutput.textContent = "";
        this.setBottomLink();
        this.instantActionInProgress = false;
    }
  }

  private interpretHash() {
    const hash = /(?:^|#)([0-9a-fA-f]{10,})/i.exec(window.location.hash);
    if (hash) {
        const hex = hash[1];
        this.elements.textInput.value = hex;
        this.setCryptionMode("decrypt");
        this.elements.passwordInput.focus();
        this.instantAction();
        this.elements.passwordTooltip.setAttribute("data-show", "");
    }
    window.location.hash = ""; // Removing hash afterwards.
  }
}
