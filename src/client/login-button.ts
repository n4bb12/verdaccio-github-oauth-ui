interface QueryParams {
  jwtToken: string
  npmToken: string
  username: string
}

(() => {
  /**
   * Displays what the user needs to run in order to authenticate using npm.
   */

  const getUsageInfo = () => {
    const username = localStorage.getItem("username")
    if (!username) {
      return []
    }
    const configBase = "//" + location.host + location.pathname
    const authToken = localStorage.getItem("npm")
    return [
      `npm config set ${configBase}:_authToken "${authToken}"`,
      `npm config set ${configBase}:always-auth true`,
    ]
  }

  const updateUsageInfo = () => {
    const info = getUsageInfo()
    const element = document.querySelector("[class*='header__headerWrap'] figure") as HTMLElement

    if (element) {
      element.innerText = info.join("\n")
    } else {
      setTimeout(updateUsageInfo, 100)
    }
  }

  //
  // By default the login button opens a form that asks the user to submit credentials.
  // We replace this behaviour and instead redirect to the route that handles OAuth.
  //
  const clickTargetHasID = (idValue: string, e: any): boolean => {
    const path = e.path || (e.composedPath && e.composedPath())
    for (const element of path) {
      if (element.id === idValue) {
        return true
      }
    }
    return false
  }

  const interruptClick = (idValue: string, callback: (e: MouseEvent) => void) => {
    const handleClick = (e: MouseEvent) => {
      if (clickTargetHasID(idValue, e)) {
        callback(e)
      }
    }
    const useCapture = true
    document.addEventListener("click", handleClick, useCapture)
  }

  interruptClick("header--button-login", e => {
    e.preventDefault()
    e.stopPropagation()
    location.href = "/-/oauth/authorize"
  })

  interruptClick("header--button-logout", e => {
    localStorage.removeItem("username")
    localStorage.removeItem("token")
    localStorage.removeItem("npm")
    updateUsageInfo()
  })

  /**
   * After a successful login we are redirected to the UI with our GitHub username
   * and a JWT token. We need to save these in local storage in order for Verdaccio
   * to remember that we are logged in.
   *
   * Also replaces the default npm usage info and displays the authToken that needs
   * to be configured.
   */

  const saveCredentials = (query: QueryParams) => {
    console.log('QUERY PARAMS', query)
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
      .map(kv => kv.split("=").concat(["true"]))
      .reduce((obj: any, pair) => {
        obj[pair[0]] = decodeURIComponent(pair[1])
        return obj
      }, {}) as QueryParams
  }

  const removeQueryParams = () => {
    history.replaceState(null, "", location.pathname)
    location.reload()
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

  handleQueryParams()
  updateUsageInfo()
})()
