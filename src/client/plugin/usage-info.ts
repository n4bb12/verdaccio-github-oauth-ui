//
// Replace the default npm usage info and displays the authToken that needs
// to be configured.
//

export function getUsageInfo() {
  const username = localStorage.getItem("username")
  if (!username) {
    return "Click the login button to authenticate with GitHub."
  }

  const configBase = (window as any).VERDACCIO_API_URL
    ? (window as any).VERDACCIO_API_URL.replace(/^https?:/, "").replace(
        /-\/verdaccio\/$/,
        "",
      )
    : `//${location.host}${location.pathname}`
  const authToken = localStorage.getItem("npm")
  return [
    `npm config set ${configBase}:_authToken "${authToken}"`,
  ].join("\n")
}
