
import {encrypt, decrypt} from "pcrypto"
import {observable, action, computed, autorunAsync} from "mobx"

const looksDecryptable = (subject: string) => /^[0-9a-f]{64,}$/i.test(subject)

export default class PasteSafeStore {
	@observable keyInput: string
	@observable textInput: string
	@observable textOutput: string
	@observable ciphertext: string
	@observable errorMessage: string

	@action
	private async encrypt(text: string, password: string) {
		let ciphertext: string
		let errorMessage: string
		try {
			ciphertext = (text && password)
				? await encrypt({password, plaintext: text})
				: ""
		}
		catch (err) {
			errorMessage = `encrypt error: ${err.name} ${err.message}`
			ciphertext = ""
		}
		this.textOutput = ciphertext
		this.ciphertext = ciphertext
		this.errorMessage = errorMessage
	}

	@action
	private async decrypt(text: string, password: string) {
		let plaintext: string
		let errorMessage: string
		try {
			plaintext = (text && password)
				? await decrypt({password, ciphertext: text})
				: ""
		}
		catch (err) {
			errorMessage = `decrypt error: ${err.name} ${err.message}`
			plaintext = ""
		}
		this.textOutput = plaintext
		this.ciphertext = text
		this.errorMessage = errorMessage
	}

	@action
	private async encryptOrDecrypt(text: string, password: string) {
		if (looksDecryptable(text)) this.decrypt(text, password)
		else this.encrypt(text, password)
	}

	private readonly reactions = [
		autorunAsync(() => this.encryptOrDecrypt(this.textInput, this.keyInput))
	]
}
