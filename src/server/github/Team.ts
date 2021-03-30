/**
 * https://docs.github.com/en/rest/reference/teams
 */
export interface GitHubTeam {
  id: number
  node_id: string
  url: string
  html_url: string
  name: string
  slug: string
  description: string
  privacy: string
  permission: string
  members_url: string
  repositories_url: string
  parent: null
  members_count: number
  repos_count: number
  created_at: string
  updated_at: string
  organization: {
    login: string
    id: number
    node_id: string
    url: string
    repos_url: string
    events_url: string
    hooks_url: string
    issues_url: string
    members_url: string
    public_members_url: string
    avatar_url: string
    description: string
    name: string
    company: string
    blog: string
    location: string
    email: string
    is_verified: boolean
    has_organization_projects: boolean
    has_repository_projects: boolean
    public_repos: number
    public_gists: number
    followers: number
    following: number
    html_url: string
    created_at: string
    updated_at: string
    type: string
  }
}
