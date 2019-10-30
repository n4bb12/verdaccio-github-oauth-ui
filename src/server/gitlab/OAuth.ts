/**
 * https://docs.gitlab.com/ce/api/oauth2.html#web-application-flow
 */
export interface GitLabOAuth {
  token_type: string
  expires_in: number,
  access_token: string,
  refresh_token: string
}
