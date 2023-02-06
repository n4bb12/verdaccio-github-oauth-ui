/**
 * https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#response
 */
export interface GoogleOAuth {
  token_type: string
  scope: string
  access_token: string
}
