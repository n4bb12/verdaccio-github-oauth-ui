import plugin from "../package.json"

export { plugin }

export const cliName = Object.keys(plugin.bin)[0]
export const pluginKey = plugin.name.replace("verdaccio-", "")
export const publicRoot = __dirname + "/../client"
export const staticPath = "/-/static/" + pluginKey
export const authorizePath = "/-/oauth/authorize"
export const callbackPath = "/-/oauth/callback"
export const loginHref = authorizePath
export const logoutHref = "/"

export const cliPort = 8239
export const cliProviderId = "cli"
export const cliAuthorizeUrl = "/oauth/authorize"

export const publicGitHubOrigin = "https://github.com"
export const publicGitHubApiOrigin = "https://api.github.com"

/**
 * See https://verdaccio.org/docs/en/packages
 */
export const authenticatedUserGroups = [
  "$all",
  "@all",
  "$authenticated",
  "@authenticated",
] as const
