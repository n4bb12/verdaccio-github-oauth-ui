/**
 * https://docs.gitlab.com/ce/api/users.html#list-current-user-for-normal-users
 */
export interface GitLabUser {
  nickname: string
  profile: string
  picture: string
  groups: [string]
}
