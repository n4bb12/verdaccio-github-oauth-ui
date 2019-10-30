/**
 * https://docs.gitlab.com/ce/api/users.html#list-current-user-for-normal-users
 */
export interface GitLabUser {
  id: number
  username: string
  email: string
  name: string
  state: string
  html_url: string
  avatar_url: string
  web_url: string
  created_at: string
}
