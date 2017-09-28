
import * as React from "react"
import {observer} from "mobx-react"
import {observable, action, computed, autorun, autorunAsync} from "mobx"

import {encrypt, decrypt} from "pcrypto"

export class PasteSafeStore {
	@observable keyInput: string = ""
	@observable textInput: string = ""
	@observable textOutput: string = ""

	@action async compute(input: string) {
		const password = this.keyInput
		const plaintext = this.textInput
		this.textOutput = (password && plaintext)
			? await encrypt({password, plaintext})
			: ""
	}

	private readonly reactions = [
		autorunAsync(async () => this.compute(this.textInput))
	]

	@computed get link() {
		return (!!this.textOutput) ? `#${this.textOutput}` : null
	}
}

@observer
export default class PasteSafe extends React.Component<{store: PasteSafeStore}> {

	private readonly handleKeyInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
		this.props.store.keyInput = event.currentTarget.value
	}

	private readonly handleTextInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = event => {
		this.props.store.textInput = event.currentTarget.value
	}

	render() {
		const {store} = this.props
		return (
			<div className="pastesafe">

				{/* KEY INPUT
					- avoid the word "password" on the input, to hide from pesky password managers
				*/}
				<input
					className="key"
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
					onChange={this.handleTextInputChange}>
				</textarea>

				{/* TEXT OUTPUT */}
				<textarea className="text-output" readOnly value={store.textOutput}></textarea>

				{/* SHARE LINK */}
				<a className="share-link" title="Shareable link" href={store.link}>
					{window.location.href + store.link}
				</a>
			</div>
		)
	}
}
