
import Flyout from "./Flyout"
import PasteSafe from "./PasteSafe"

// Forcing HTTPS in production.
const production = /github\.io/i.test(window.location.host) || /pastesafe\.com/i.test(window.location.host);

if (production && !/https/i.test(window.location.protocol))
	window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);

const flyout = new Flyout({
	baseplate: <HTMLElement> document.querySelector(".baseplate"),
	toggleButtons: <HTMLElement[]> Array.from(document.querySelectorAll(".flyout-toggle-button"))
})

const pasteSafe = new PasteSafe({
	root: <HTMLElement> document.querySelector("[paste-safe]"),
	officialBaseLink: window.location.origin + "/"
})
