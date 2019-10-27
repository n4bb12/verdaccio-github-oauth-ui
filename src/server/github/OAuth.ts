/**
 * https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#response
 */
export interface GitHubOAuth {
  token_type: string
  scope: string
  access_token: string
}
