/**
 * https://docs.gitlab.com/ce/api/groups.html#list-groups
 */
export interface GitLabGroup {
  id: number
  name: string
  path: string
  description: string
  visibility: string
}
