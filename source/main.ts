
import Flyout from "./Flyout"
import PasteSafe from "./PasteSafe"

const flyout = new Flyout({
  baseplate: <HTMLElement> document.querySelector(".baseplate"),
  toggleButtons: <HTMLElement[]> Array.from(document.querySelectorAll(".flyout-toggle-button"))
})

const pasteSafe = new PasteSafe({
  root: <HTMLElement> document.querySelector("[paste-safe]")
})
