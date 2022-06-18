import { Request } from "express"
import uniq from "lodash/uniq"
import { stringify } from "querystring"
import { publicGitHubApiOrigin, publicGitHubOrigin } from "../../constants"
import { AuthProvider } from "../plugin/AuthProvider"
import { ParsedPluginConfig } from "../plugin/Config"
import { GitHubClient } from "./Client"

export class GitHubAuthProvider implements AuthProvider {
  private readonly id = "github"

  private readonly webBaseUrl =
    this.config.enterpriseOrigin || publicGitHubOrigin

  private readonly apiBaseUrl = this.config.enterpriseOrigin
    ? this.config.enterpriseOrigin.replace(/\/?$/, "") + "/api/v3"
    : publicGitHubApiOrigin

  private readonly client = new GitHubClient(this.webBaseUrl, this.apiBaseUrl)

  constructor(private readonly config: ParsedPluginConfig) {}

  getId() {
    return this.id
  }

  getLoginUrl(callbackUrl: string) {
    const queryParams = stringify({
      client_id: this.config.clientId,
      redirect_uri: callbackUrl,
    })
    return this.webBaseUrl + `/login/oauth/authorize?` + queryParams
  }

  getCode(req: Request) {
    return req.query.code as string
  }

  async getToken(code: string) {
    const response = await this.client.requestAccessToken(
      code,
      this.config.clientId,
      this.config.clientSecret,
    )
    return response.authentication.token
  }

  async getUserName(token: string) {
    const response = await this.client.requestUser(token)
    return response.data.login
  }

  async getGroups(userName: string) {
    const configuredUser = this.config.parsedUsers.find(
      (config) => config.user === userName,
    )

    const groups: string[] = []
    const promises: Promise<void>[] = []
    const registryToken = String(this.config.token)

    if (configuredUser) {
      groups.push(configuredUser.group)
    }

    this.config.parsedOrgs.forEach((config) => {
      const job = async () => {
        const canAccess = await this.client.requestOrganizationMembershipStatus(
          registryToken,
          config.org,
          userName,
        )
        if (canAccess) {
          groups.push(config.group)
        }
      }
      promises.push(job())
    })

    this.config.parsedTeams.forEach((config) => {
      const job = async () => {
        const canAccess = await this.client.requestTeamMembershipStatus(
          registryToken,
          config.org,
          config.team,
          userName,
        )
        if (canAccess) {
          groups.push(config.group)
        }
      }
      promises.push(job())
    })

    this.config.parsedRepos.forEach((config) => {
      const job = async () => {
        const canAccess = await this.client.requestRepositoryCollaboratorStatus(
          registryToken,
          config.owner,
          config.repo,
          userName,
        )
        if (canAccess) {
          groups.push(config.group)
        }
      }
      promises.push(job())
    })

    await Promise.all(promises)

    return uniq(groups).filter(Boolean).sort()
  }
}
