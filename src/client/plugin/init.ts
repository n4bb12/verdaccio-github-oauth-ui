import { loginHref, logoutHref } from "../../constants"
import {
  clearCredentials,
  Credentials,
  isLoggedIn,
  saveCredentials,
  validateCredentials,
} from "./credentials"
import { interruptClick, parseCookies, retry } from "./lib"

function saveAndRemoveCookies() {
  if (isLoggedIn()) {
    return
  }

  const credentials: Credentials = parseCookies(document.cookie) as any
  if (!validateCredentials(credentials)) {
    return
  }

  saveCredentials(credentials)

  Object.keys(credentials).forEach(
    (key) => (document.cookie = `${key}=;expires=${new Date(0).toUTCString()}`),
  )

  location.reload()
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
  saveAndRemoveCookies()

  const { loginButton, logoutButton, updateUsageInfo } = options

  interruptClick(loginButton, () => {
    location.href = loginHref
  })

  interruptClick(logoutButton, () => {
    clearCredentials()
    if (location.pathname === logoutHref) {
      location.reload()
    } else {
      location.href = logoutHref
    }
  })

  document.addEventListener("click", () => retry(updateUsageInfo))
  retry(updateUsageInfo)
}
