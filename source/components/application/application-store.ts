
import {observable} from "mobx"
import PasteSafeStore from "../pastesafe/pastesafe-store"

export default class ApplicationStore {
	pastesafe: PasteSafeStore = new PasteSafeStore()
}
