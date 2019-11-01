import { loginHref, logoutHref } from "../config"
import {
  clearCredentials,
  Credentials,
  isLoggedIn,
  saveCredentials,
  validateCredentials,
} from "./credentials"
import { interruptClick, parseQueryParams, retry } from "./lib"

/**
 * Change the current URL to only the current pathname and reload.
 * We don't use `location.href` because we want the query params
 * to be excluded from the history.
 */
function reloadToPathname() {
  history.replaceState(null, "", location.pathname)
  location.reload()
}

function saveAndRemoveQueryParams() {
  if (isLoggedIn()) {
    return
  }

  const credentials: Credentials = parseQueryParams()
  if (!validateCredentials(credentials)) {
    return
  }

  saveCredentials(credentials)
  reloadToPathname()
}

//
// Shared API
//

export interface InitOptions {
  loginButton: string
  logoutButton: string
  updateUsageInfo: () => void
}

//
// By default the login button opens a form that asks the user to submit credentials.
// We replace this behaviour and instead redirect to the route that handles OAuth.
//

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

  document.addEventListener("click", () => retry(updateUsageInfo))
  retry(updateUsageInfo)
}
