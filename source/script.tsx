
import * as React from "react"
import * as ReactDom from "react-dom"

import Application from "./components/application/application"
import ApplicationStore from "./components/application/application-store"

const store = new ApplicationStore()

ReactDom.render(<Application {...{store}}/>, document.querySelector("body > .container"))
