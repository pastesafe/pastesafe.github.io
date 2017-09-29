
import * as React from "react"
import * as ReactDom from "react-dom"

import PasteSafe from "./components/pastesafe/pastesafe"
import PasteSafeStore from "./components/pastesafe/pastesafe-store"

const pastesafe = <PasteSafe store={new PasteSafeStore()}/>
const container = document.querySelector(".pastesafe-container")
ReactDom.render(pastesafe, container)
