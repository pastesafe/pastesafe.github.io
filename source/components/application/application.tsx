
import * as React from "react"
import {observer} from "mobx-react"

import PasteSafe from "../pastesafe/pastesafe"

import ApplicationStore from "./application-store"

export default observer(({store}: {store: ApplicationStore}) =>
	<div className="application">
		<h1>pastesafe v0.12.0-dev</h1>
		<PasteSafe store={store.pastesafe}/>
	</div>
)
