//
// After a successful login we are redirected to the UI with our username
// and a JWT token. We need to save these in local storage so Verdaccio
// thinks we are logged in.
//

import { parseJwt } from "./lib"

export interface Credentials {
  username: string
  uiToken: string
  npmToken: string
}

export function saveCredentials(credentials: Credentials) {
  localStorage.setItem("username", credentials.username)
  localStorage.setItem("token", credentials.uiToken)
  localStorage.setItem("npm", credentials.npmToken)
}

export function clearCredentials() {
  localStorage.removeItem("username")
  localStorage.removeItem("token")
  localStorage.removeItem("npm")
}

export function isLoggedIn() {
  return (
    true &&
    !!localStorage.getItem("username") &&
    !!localStorage.getItem("token") &&
    !!localStorage.getItem("npm")
  )
}

export function isTokenExpired() {
  const token = localStorage.getItem("token")
  if (typeof token !== "string") {
    return true
  }

  const payload = parseJwt(token)
  if (!payload) {
    return true
  }

  // Report as expired before (real expiry - 30s)
  const jsTimestamp = payload.exp * 1000 - 30000
  return Date.now() >= jsTimestamp
}

export function validateCredentials(credentials: Credentials) {
  return (
    true && credentials.username && credentials.uiToken && credentials.npmToken
  )
}
