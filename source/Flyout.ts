
export interface FlyoutOptions {
  baseplate: HTMLElement
  toggleButtons: HTMLElement[]
}

export default class Flyout {
  baseplate: HTMLElement
  toggleButtons: HTMLElement[]

  constructor({baseplate, toggleButtons}: FlyoutOptions) {
    this.baseplate = baseplate
    this.toggleButtons = toggleButtons
    this.baseplate.setAttribute("data-flyout-state", window.localStorage.getItem("flyout") || "active")
    this.toggleButtons.forEach(toggle => toggle.onclick = event => this.toggleHandler(event))
  }

  private toggleHandler(event) {
    var currentState = this.baseplate.getAttribute("data-flyout-state")
    var newState = currentState==="active" ?"hidden" :"active"
    this.baseplate.setAttribute("data-flyout-state", newState)
    window.localStorage.setItem("flyout", newState)
    if (event) {
      event.preventDefault()
      return false
    }
  }
}
