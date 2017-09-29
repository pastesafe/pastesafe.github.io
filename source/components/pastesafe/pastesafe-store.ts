
import {encrypt, decrypt} from "pcrypto"
import {observable, action, computed, autorunAsync} from "mobx"

const looksDecryptable = (subject: string) => /^[0-9a-f]{64,}$/i.test(subject)

export default class PasteSafeStore {
	@observable keyInput: string
	@observable textInput: string
	@observable textOutput: string
	@observable ciphertext: string
	@observable error: Error

	@action
	private async encrypt(text: string, password: string) {
		let ciphertext: string
		let error: Error
		try {
			ciphertext = (text && password)
				? await encrypt({password, plaintext: text})
				: ""
		}
		catch (err) {
			err.message = `encrypt error: ${err.message}`
			error = err
			ciphertext = ""
		}
		this.textOutput = ciphertext
		this.ciphertext = ciphertext
		this.error = error
	}

	@action
	private async decrypt(text: string, password: string) {
		let plaintext: string
		let error: Error
		try {
			plaintext = (text && password)
				? await decrypt({password, ciphertext: text})
				: ""
		}
		catch (err) {
			err.message = `decrypt error: ${err.message}`
			error = err
			plaintext = ""
		}
		this.textOutput = plaintext
		this.ciphertext = text
		this.error = error
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
