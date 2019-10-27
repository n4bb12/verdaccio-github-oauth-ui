import { clearQueryParams, parseQueryParams } from "./lib"

interface QueryParams {
  username: string
  jwtToken: string
  npmToken: string
}

const loginHref = "/-/oauth/authorize"
const logoutHref = "/"

//
// By default the login button opens a form that asks the user to submit credentials.
// We replace this behaviour and instead redirect to the route that handles OAuth.
//

function pathContainsElement(selector: string, e: any): boolean {
  const path: Element[] = e.path || (e.composedPath && e.composedPath())
  const element = document.querySelector(selector)!

  return path.indexOf(element) >= 0
}

function interruptClick(selector: string, callback: () => void) {
  const handleClick = (e: MouseEvent) => {
    if (pathContainsElement(selector, e)) {
      e.preventDefault()
      e.stopPropagation()
      callback()
    }
  }
  const capture = true
  document.addEventListener("click", handleClick, capture)
}

//
// After a successful login we are redirected to the UI with our GitHub username
// and a JWT token. We need to save these in local storage in order for Verdaccio
// to remember that we are logged in.
//

function saveCredentials(query: QueryParams) {
  localStorage.setItem("username", query.username)
  localStorage.setItem("token", query.jwtToken)
  localStorage.setItem("npm", query.npmToken)
}

function clearCredentials() {
  localStorage.removeItem("username")
  localStorage.removeItem("token")
  localStorage.removeItem("npm")
}

function credentialsAreSaved() {
  return true
    && !!localStorage.getItem("username")
    && !!localStorage.getItem("token")
    && !!localStorage.getItem("npm")
}

function credentialsAreValid(query: QueryParams) {
  return true
    && query.username
    && query.jwtToken
    && query.npmToken
}

function saveAndRemoveQueryParams() {
  if (credentialsAreSaved()) {
    return
  }

  const query: QueryParams = parseQueryParams()

  if (!credentialsAreValid(query)) {
    return
  }

  saveCredentials(query)
  clearQueryParams()
  location.reload() // re-render UI
}

//
// Replace the default npm usage info and displays the authToken that needs
// to be configured.
//

function updateUsageInfoWithRetry(updateUsageInfo: () => void) {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => updateUsageInfo(), 100 * i)
  }
}

export function formatUsageInfo() {
  const username = localStorage.getItem("username")
  if (!username) {
    return "Click the login button to authenticate with GitHub."
  }

  const configBase = "//" + location.host + location.pathname
  const authToken = localStorage.getItem("npm")
  return [
    `npm config set ${configBase}:_authToken "${authToken}"`,
    `npm config set ${configBase}:always-auth true`,
  ].join("\n")
}

export function copyToClipboard(text: string) {
  // https://github.com/verdaccio/ui/blob/master/src/utils/cli-utils.ts
  const node = document.createElement("div")
  node.innerText = text
  document.body.appendChild(node)
  const range = document.createRange()
  const selection = window.getSelection() as Selection
  range.selectNodeContents(node)
  selection.removeAllRanges()
  selection.addRange(range)
  document.execCommand("copy")
  document.body.removeChild(node)
}

//
// Shared API
//

export function isLoggedIn() {
  return credentialsAreSaved()
}

export interface InitOptions {
  loginButton: string
  logoutButton: string
  updateUsageInfo: () => void
}

export function init(options: InitOptions) {
  saveAndRemoveQueryParams()

  const { loginButton, logoutButton, updateUsageInfo } = options

  interruptClick(loginButton, () => {
    location.href = loginHref
  })

  interruptClick(logoutButton, () => {
    clearCredentials()
    location.href = logoutHref
  })

  document.addEventListener("click", () => updateUsageInfoWithRetry(updateUsageInfo))
  updateUsageInfoWithRetry(updateUsageInfo)
}
