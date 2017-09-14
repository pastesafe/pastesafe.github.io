
import * as pcrypto from "pcrypto"

export interface PasteSafeOptions {
	root: HTMLElement
	officialBaseLink: string
}

export default class PasteSafe {

	/** Base URL to the PasteSafe app. */
	officialBaseLink: string

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
	constructor({root, officialBaseLink}: PasteSafeOptions) {
		this.officialBaseLink = officialBaseLink

		// Query for HTML elements under the provided root element.
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

		// Prevent standard click action on the bottom link.
		this.elements.bottomLink.onclick = function(event) {
				event.preventDefault
				return false
		}

		// Hide the word 'password' from the password input, to avoid pesky password managers.
		this.elements.passwordInput.setAttribute("type", "password")
		this.elements.passwordInput.setAttribute("placeholder", "Password")

		// Start with focus on the password box.
		this.elements.passwordInput.focus()

		// Start with the bottom link empty.
		this.setBottomLink()

		// Event bindings for cryption mode change.
		this.elements.encryptButton.addEventListener("change", () => this.refreshCryptionMode())
		this.elements.decryptButton.addEventListener("change", () => this.refreshCryptionMode())
		this.refreshCryptionMode()

		// Event bindings for instant encryption/decryption.
		this.elements.textInput.addEventListener("keyup", () => this.instantAction())
		this.elements.passwordInput.addEventListener("keyup", () => this.instantAction())
		this.elements.encryptButton.addEventListener("change", () => this.instantAction())
		this.elements.decryptButton.addEventListener("change", () => this.instantAction())
		this.instantAction()

		// Consume ciphertext to decrypt from the URL hash fragment.
		window.addEventListener("hashchange", () => this.interpretHash())
		this.interpretHash()
	}

	/**
	 * Update the link at the bottom with fresh ciphertext.
	 */
	private setBottomLink(ciphertext?: string) {
		if (ciphertext) {
				this.elements.bottomLink.href = this.officialBaseLink + "#" + ciphertext
				this.elements.bottomLink.textContent = this.officialBaseLink + "#" + ciphertext.substring(0, 8) + "..."
				this.elements.bottomLink.setAttribute("data-show", "")
		}
		else {
				this.elements.bottomLink.href = "#"
				this.elements.bottomLink.textContent = ""
				this.elements.bottomLink.removeAttribute("data-show")
		}
	}

	/**
	 * Return whether we are in "encrypt" or "decrypt" mode.
	 */
	private getCryptionMode(): string | "encrypt" | "decrypt" {
		const checkedRadioButton = <HTMLInputElement> this.elements.root.querySelector("input[name=cryption_mode]:checked")
		return checkedRadioButton.value
	}

	/**
	 * Change the cryption mode to "encrypt" or "decrypt".
	 */
	private setCryptionMode(mode: "encrypt" | "decrypt") {
		this.elements.encryptButton.checked = (mode === "encrypt") ? true : false;
		this.elements.decryptButton.checked = (mode === "decrypt") ? true : false;
		this.refreshCryptionMode()
	}

	/**
	 * Set the [data-cryption-mode] attribute to "encrypt" or "decrypt", and update button states.
	 */
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

	/**
	 * Perform encryption or decryption.
	 *  - debounced so it can only happen once at a time.
	 */
	private async instantAction() {
		if (this.instantActionInProgress) return
		this.instantActionInProgress = true

		this.elements.passwordTooltip.removeAttribute("data-show")

		// If there is text input and there is password input, proceed with the instant action.
		if (!!this.elements.textInput.value && !!this.elements.passwordInput.value) {

				// Perform encryption.
				if (this.getCryptionMode() === "encrypt") {
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
				}
		}

		// Otherwise the iputs are incomplete, so we just clear things out.
		else {
				this.elements.textOutput.textContent = ""
				this.setBottomLink()
		}

		this.instantActionInProgress = false
	}

	/**
	 * Consume and decrypt ciphertext in the URL hash fragment.
	 */
	private interpretHash() {
		const hash = /(?:^|#)([0-9a-fA-f]{10,})/i.exec(window.location.hash);
		if (hash) {
				const hex = hash[1]
				this.elements.textInput.value = hex
				this.setCryptionMode("decrypt")
				this.elements.passwordInput.focus()
				this.instantAction()
				this.elements.passwordTooltip.setAttribute("data-show", "")
		}
		window.location.hash = "" // Removing hash afterwards.
	}
}
