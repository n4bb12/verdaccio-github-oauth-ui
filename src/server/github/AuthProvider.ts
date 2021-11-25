import { Request } from "express"
import { stringify } from "querystring"

import { AuthProvider } from "../plugin/AuthProvider"
import { Config, getConfig } from "../plugin/Config"
import { GitHubClient } from "./Client"

export class GitHubAuthProvider implements AuthProvider {
  private readonly clientId = getConfig(this.config, "client-id")
  private readonly clientSecret = getConfig(this.config, "client-secret")
  private readonly enterpriseOrigin = getConfig(
    this.config,
    "enterprise-origin",
  )
  private readonly client = new GitHubClient(this.webBaseUrl, this.apiBaseUrl)

  get webBaseUrl(): string {
    return this.enterpriseOrigin || "https://github.com"
  }

  get apiBaseUrl(): string {
    return this.enterpriseOrigin
      ? this.enterpriseOrigin.replace(/\/?$/, "") + "/api/v3"
      : "https://api.github.com"
  }

  constructor(private readonly config: Config) {}

  getId() {
    return "github"
  }

  getLoginUrl(callbackUrl: string) {
    const queryParams = stringify({
      client_id: this.clientId,
      redirect_uri: callbackUrl,
      scope: "read:org,repo",
    })
    return this.webBaseUrl + `/login/oauth/authorize?` + queryParams
  }

  getCode(req: Request) {
    return req.query.code as string
  }

  async getToken(code: string) {
    const auth = await this.client.requestAccessToken(
      code,
      this.clientId,
      this.clientSecret,
    )
    return auth.authentication.token
  }

  async getUsername(token: string) {
    const user = await this.client.requestUser(token)
    return user.data.login
  }

  async getGroups(token: string) {
    const [orgs, teams, repos] = await Promise.all([
      this.client.requestUserOrgs(token),
      this.client.requestUserTeams(token),
      this.client.requestUserRepos(token),
    ])

    const orgGroups = orgs.map((org) => `github/${org.login}`)
    const legacyTeamGroups = teams.map(
      (team) => `github/${team.organization?.login}/${team.name}`,
    )
    const teamGroups = teams.map(
      (team) => `github/${team.organization?.login}/team/${team.name}`,
    )
    const repoGroups = repos.map(
      (repo) => `github/${repo.owner?.login}/repo/${repo.name}`,
    )

    return [...orgGroups, ...legacyTeamGroups, ...teamGroups, ...repoGroups]
  }
}
