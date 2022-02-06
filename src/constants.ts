export const pluginName = "github-oauth-ui"
export const publicRoot = __dirname + "/../browser"
export const staticPath = "/-/static/" + pluginName
export const authorizePath = "/-/oauth/authorize"
export const callbackPath = "/-/oauth/callback"

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
