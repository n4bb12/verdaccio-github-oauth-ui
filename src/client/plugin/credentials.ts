//
// After a successful login we are redirected to the UI with our username
// and a JWT token. We need to save these in local storage so Verdaccio
// thinks we are logged in.
//

export interface Credentials {
  username: string
  jwtToken: string
  npmToken: string
}

export function saveCredentials(credentials: Credentials) {
  localStorage.setItem("username", credentials.username)
  localStorage.setItem("token", credentials.jwtToken)
  localStorage.setItem("npm", credentials.npmToken)
}

export function clearCredentials() {
  localStorage.removeItem("username")
  localStorage.removeItem("token")
  localStorage.removeItem("npm")
}

export function isLoggedIn() {
  return true
    && !!localStorage.getItem("username")
    && !!localStorage.getItem("token")
    && !!localStorage.getItem("npm")
}

export function validateCredentials(credentials: Credentials) {
  return true
    && credentials.username
    && credentials.jwtToken
    && credentials.npmToken
}
