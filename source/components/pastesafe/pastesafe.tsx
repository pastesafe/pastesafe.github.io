
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

	private readonly references: { textInput: Reference<HTMLTextAreaElement> } = {
		textInput: {
			ref: element => this.references.textInput.element = element,
			element: null
		}
	}

	@action
	private readonly updateTextInput = (input: string) => {
		this.props.store.textInput = input.toString().trim()
	}

	@action
	private readonly handleKeyInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
		this.props.store.keyInput = event.currentTarget.value.toString().trim()
	}

	private readonly handleTextInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = event => {
		this.updateTextInput(event.currentTarget.value)
	}

	private readonly handleSwap: React.MouseEventHandler<HTMLButtonElement> = event => {
		const newInput = this.props.store.textOutput
		this.references.textInput.element.value = newInput
		this.updateTextInput(newInput)
	}

	render() {
		const {store} = this.props
		return (
			<div className="pastesafe" data-error={!!store.error}>

				{/* KEY INPUT
					- avoid the word "password" on the input, to hide from pesky password managers
				*/}
				<input
					className="key-input"
					type="text"
					placeholder="Key"
					autoComplete="off"
					maxLength={32}
					onChange={this.handleKeyInputChange}
				/>

				{/* TEXT INPUT */}
				<textarea
					className="text-input"
					placeholder="Secret message"
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
				<button className="swap-button" onClick={this.handleSwap}>Swap</button>

				{/* ERROR REPORT */}
				{store.error ?
					<div className="error-report">{store.error.message || "unknown error"}</div>
					: null}

				{/* SHARE LINK */}
				{store.ciphertext ?
					<a className="share-link" title="Shareable link" href={"#" + store.ciphertext}>
						{window.location.href + "#" + store.ciphertext.substring(0, 8) + "..."}
					</a>
					: null}

			</div>
		)
	}
}
