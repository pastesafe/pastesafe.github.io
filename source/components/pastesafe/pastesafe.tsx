
import * as React from "react"
import {observer} from "mobx-react"

import PasteSafeStore from "./pastesafe-store"

export default observer(({store}: {store: PasteSafeStore}) =>
	<div className="pastesafe">

		<div className="controls">
			<label className="cell mode-button" htmlFor="encrypt" data-checked>
				<input id="encrypt" className="encrypt" type="radio" name="cryption_mode" value="encrypt" checked/>
				Encrypt
			</label>
			<label className="cell mode-button" htmlFor="decrypt">
				<input id="decrypt" className="decrypt" type="radio" name="cryption_mode" value="decrypt"/>
				Decrypt
			</label>
			<div className="cell">
				<div className="passbox">
					{/*avoid the word "password" on the input, to hide from pesky password managers.*/}
					<input className="key" type="text" placeholder="Key" autoComplete="off" maxLength={32}/>
					<div className="tooltip">
						<p>Enter the password here to decrypt the message!</p>
					</div>
				</div>
			</div>
		</div>

		<textarea className="text-input" placeholder="Secret message"></textarea>

		<textarea className="text-output" readOnly></textarea>

		<div className="linkbox">
			<a className="bottom-link" title="Shareable link" href="#"></a>
		</div>
	</div>
)
