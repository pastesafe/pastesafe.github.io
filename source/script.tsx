
import * as React from "react"
import * as ReactDom from "react-dom"

import {action} from "mobx"

import PasteSafe from "./components/pastesafe/pastesafe"
import PasteSafeStore from "./components/pastesafe/pastesafe-store"

const store = new PasteSafeStore()

const pastesafe = <PasteSafe {...{store}}/>
const container = document.querySelector(".pastesafe-container")
ReactDom.render(pastesafe, container)
