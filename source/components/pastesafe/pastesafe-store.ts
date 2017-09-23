
import {observable} from "mobx"

export default class PasteSafeStore {

	@observable
	textInput: string = ""

	@observable
	textOutput: string = ""
}
