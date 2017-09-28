
import {action} from "mobx"
import * as React from "react"
import {observer} from "mobx-react"

import PasteSafeStore from "./pastesafe-store"

@observer
export default class PasteSafe extends React.Component<{store: PasteSafeStore}> {

	@action
	private readonly handleKeyInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
		this.props.store.keyInput = event.currentTarget.value.toString().trim()
	}

	@action
	private readonly handleTextInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = event => {
		this.props.store.textInput = event.currentTarget.value.toString().trim()
	}

	render() {
		const {store} = this.props
		return (
			<div className="pastesafe" data-error={!!store.error}>

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
