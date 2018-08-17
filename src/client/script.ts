interface QueryParams {
  jwtToken: string
  npmToken: string
  username: string
}

/**
 * By default the login button opens a form that asks the user to submit credentials.
 * We replace this behaviour and instead redirect to the route that handles OAuth.
 */
; (() => {
  const interruptLoginButtonClick = (e) => {
    const path = e.path || (e.composedPath && e.composedPath())
    for (const element of path) {
      if (element.classList && element.classList.contains("header-button-login")) {
        e.preventDefault()
        e.stopPropagation()
        location.href = "/-/oauth/authorize"
        return
      }
    }
  }
  const useCapture = true
  document.addEventListener("click", interruptLoginButtonClick, useCapture)
})();

/**
 * After a successful login we are redirected to the UI with our GitHub username 
 * and a JWT token. We need to save these in local storage in order for Verdaccio 
 * to remember that we are logged in.
 * 
 * Also replaces the default npm usage info and displays the authToken that needs 
 * to be configured.
 */
; (() => {
  const saveCredentials = (query: QueryParams) => {
    localStorage.setItem("username", query.username)
    localStorage.setItem("token", query.jwtToken)
    localStorage.setItem("npm", query.npmToken)
  }

  const credentialsAreSaved = () => {
    return localStorage.getItem("username")
      && !!localStorage.getItem("token")
      && !!localStorage.getItem("npm")
  }

  /**
   * Returns `?a=b&c` as `{ a: b, c: true }`.
   */
  const parseQueryParams = () => {
    return (location.search || "?")
      .substring(1)
      .split("&")
      .filter(kv => kv)
      .map(kv => [...kv.split("="), "true"])
      .reduce((obj, pair) => {
        obj[pair[0]] = decodeURIComponent(pair[1])
        return obj
      }, {}) as QueryParams
  }

  const removeQueryParams = () => {
    history.replaceState(null, "", location.pathname)
  }

  /**
   * Saves query parameters in local storage and removes them from the URL.
   */
  const handleQueryParams = () => {
    if (credentialsAreSaved()) {
      return
    }
    const query = parseQueryParams()
    if (!query.username || !query.jwtToken) {
      return
    }

    saveCredentials(query)
    removeQueryParams()
  }

  const getUsageInfo = () => {
    const authToken = localStorage.getItem("npm")
    if (!authToken) {
      return []
    }
    const configBase = "//" + location.host + location.pathname
    return [
      `npm config set ${configBase}:_authToken "${authToken}"`,
      `npm config set ${configBase}:always-auth true`,
    ]
  }

  /**
   * Displays what the user needs to run in order to authenticate with this
   * registry using npm.
   */
  const updateUsageInfo = () => {
    const info = getUsageInfo()
    const element = document.querySelector("[class^='src-webui-components-Header-header'] figure")
    if (element) {
      element.innerHTML = info.join("<br>")
    } else {
      setTimeout(100, updateUsageInfo)
    }
  }

  handleQueryParams()
  updateUsageInfo()
})();
