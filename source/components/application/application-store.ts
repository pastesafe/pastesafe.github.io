
import {observable} from "mobx"
import {PasteSafeStore} from "../pastesafe/pastesafe"

export default class ApplicationStore {
	pastesafe: PasteSafeStore = new PasteSafeStore()
}
