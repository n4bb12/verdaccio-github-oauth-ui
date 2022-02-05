import { Request } from "express"
import { stringify } from "querystring"
import { publicGitHubApiOrigin, publicGitHubOrigin } from "../../constants"
import { AuthProvider } from "../plugin/AuthProvider"
import { ParsedPluginConfig } from "../plugin/Config"
import { GitHubClient } from "./Client"

export class GitHubAuthProvider implements AuthProvider {
  private readonly client = new GitHubClient(this.webBaseUrl, this.apiBaseUrl)

  get webBaseUrl(): string {
    return this.config.enterpriseOrigin || publicGitHubOrigin
  }

  get apiBaseUrl(): string {
    return this.config.enterpriseOrigin
      ? this.config.enterpriseOrigin.replace(/\/?$/, "") + "/api/v3"
      : publicGitHubApiOrigin
  }

  constructor(private readonly config: ParsedPluginConfig) {}

  getId() {
    return "github"
  }

  getLoginUrl(callbackUrl: string) {
    const queryParams = stringify({
      client_id: this.config.clientId,
      redirect_uri: callbackUrl,
      scope: this.config.repositoryAccess ? "read:org,repo" : "read:org",
    })
    return this.webBaseUrl + `/login/oauth/authorize?` + queryParams
  }

  getCode(req: Request) {
    return req.query.code as string
  }

  async getToken(code: string) {
    const auth = await this.client.requestAccessToken(
      code,
      this.config.clientId,
      this.config.clientSecret,
    )
    return auth.authentication.token
  }

  async getUsername(token: string) {
    const user = await this.client.requestUser(token)
    return user.data.login
  }

  createOwnerGroup(orgName: string) {
    return `${this.getId()}/owner/${orgName}`
  }

  createTeamGroup(orgName: string, teamName: string) {
    return `${this.createOwnerGroup(orgName)}/team/${teamName}`
  }

  createRepoGroup(ownerName: string, repoName: string) {
    return `${this.createOwnerGroup(ownerName)}/repo/${repoName}`
  }

  createLegacyOrgGroup(orgName: string) {
    return `${this.getId()}/${orgName}`
  }

  createLegacyTeamGroup(orgName: string, teamName: string) {
    return `${this.createLegacyOrgGroup(orgName)}/team/${teamName}`
  }

  async getGroups(token: string) {
    const [username, orgs, teams, repos] = await Promise.all([
      this.getUsername(token),
      this.client.requestUserOrgs(token),
      this.client.requestUserTeams(token),
      this.config.repositoryAccess
        ? this.client.requestUserRepos(token)
        : Promise.resolve([]),
    ])

    const orgGroups = orgs.map((org) => this.createOwnerGroup(org.login))
    const teamGroups = teams.map((team) =>
      this.createTeamGroup(team.organization?.login, team.name),
    )
    const repoGroups = repos.map((repo) =>
      this.createRepoGroup(repo.owner.login, repo.name),
    )
    const userGroup = this.createOwnerGroup(username)
    const legacyOrgGroups = orgs.map((org) =>
      this.createLegacyOrgGroup(org.login),
    )
    const legacyTeamGroups = teams.map((team) =>
      this.createLegacyTeamGroup(team.organization.login, team.name),
    )

    return [
      ...orgGroups,
      ...teamGroups,
      ...repoGroups,
      userGroup,
      ...legacyOrgGroups,
      ...legacyTeamGroups,
    ]
  }
}
