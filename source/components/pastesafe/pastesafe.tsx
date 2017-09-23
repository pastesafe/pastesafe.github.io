
import * as React from "react"
import {observer} from "mobx-react"

import PasteSafeStore from "./pastesafe-store"

export default observer(({store}: {store: PasteSafeStore}) =>
	<div className="pastesafe">

		{/* avoid the word "password" on the input, to hide from pesky password managers */}
		<input className="key" type="text" placeholder="Key" autoComplete="off" maxLength={32}/>

		<textarea className="text-input" placeholder="Secret message"></textarea>

		<textarea className="text-output" readOnly></textarea>

		<a className="share-link" title="Shareable link" href="#"></a>
	</div>
)
