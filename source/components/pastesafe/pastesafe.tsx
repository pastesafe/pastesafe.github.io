
import {action} from "mobx"
import * as React from "react"
import {observer} from "mobx-react"

import PasteSafeStore from "./pastesafe-store"

interface Reference<T extends HTMLElement> {
	ref: React.Ref<T>
	element: T
}

@observer
export default class PasteSafe extends React.Component<{store: PasteSafeStore}> {

	private readonly references = {
		textInput: {
			ref: element => this.references.textInput.element = element,
			element: null
		} as Reference<HTMLTextAreaElement>
	}

	@action
	private readonly updateStoreTextInput = (input: string) => {
		this.props.store.textInput = input
	}

	@action
	private readonly handleKeyInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
		this.props.store.keyInput = event.currentTarget.value.toString().trim()
	}

	private readonly handleTextInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = event => {
		this.updateStoreTextInput(event.currentTarget.value)
	}

	private readonly handleSwap: React.MouseEventHandler<HTMLAnchorElement> = event => {
		const newInput = this.props.store.textOutput
		if (newInput) {
			this.references.textInput.element.value = newInput
			this.updateStoreTextInput(newInput)
		}
	}

	@action
	private readonly consumeHash = () => {
		const hash = /(?:^|#)([0-9a-f]{10,})/i.exec(window.location.hash);
		if (hash) {
			const hex = hash[1]
			this.references.textInput.element.value = hex
			this.updateStoreTextInput(hex)
		}
		window.location.hash = ""
	}

	componentDidMount() {
		this.consumeHash()
		window.addEventListener("hashchange", this.consumeHash)
	}

	componentWillUnmount() {
		window.removeEventListener("hashchange", this.consumeHash)
	}

	render() {
		const {store} = this.props
		return (
			<div className="pastesafe" data-error={!!store.errorMessage}>

				{/* KEY INPUT
					- avoid the word "password" on the input, to hide from pesky password managers
				*/}
				<input
					className="key-input"
					type="text"
					placeholder="key"
					autoComplete="off"
					maxLength={2048}
					onChange={this.handleKeyInputChange}
				/>

				{/* TEXT INPUT */}
				<textarea
					className="text-input"
					placeholder="secret message"
					onChange={this.handleTextInputChange}
					ref={this.references.textInput.ref}>
				</textarea>

				{/* TEXT OUTPUT */}
				<textarea
					className="text-output"
					value={store.textOutput}
					readOnly>
				</textarea>

				{/* SWAP BUTTON */}
				{store.textOutput ?
					<a className="swap-button"
						onClick={this.handleSwap}>
							swap
					</a>
					: null}

				{/* ERROR REPORT */}
				{store.errorMessage ?
					<div className="error-report">{store.errorMessage}</div>
					: null}

				{/* SHARE LINK */}
				{store.ciphertext ?
					<a className="share-link" title="shareable link" href={"#" + store.ciphertext}>
						{window.location.href + "#" + store.ciphertext.substring(0, 8) + "..."}
					</a>
					: null}

			</div>
		)
	}
}
