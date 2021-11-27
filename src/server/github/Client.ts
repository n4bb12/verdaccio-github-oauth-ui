import { exchangeWebFlowCode } from "@octokit/oauth-methods"
import { request } from "@octokit/request"
import { Octokit } from "octokit"

export class GitHubClient {
  constructor(
    private readonly webBaseUrl: string,
    private readonly apiBaseUrl: string,
  ) {}

  private createOktokit(accessToken: string) {
    return new Octokit({ auth: accessToken, baseUrl: this.apiBaseUrl })
  }

  /**a
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](bit.ly/2mNSppX).
   */
  requestAccessToken = async (
    code: string,
    clientId: string,
    clientSecret: string,
  ) => {
    try {
      return await exchangeWebFlowCode({
        clientType: "oauth-app",
        clientId,
        clientSecret,
        code,
        request: request.defaults({
          baseUrl: this.webBaseUrl,
        }),
      })
    } catch (error) {
      throw new Error("Failed requesting GitHub access token: " + error.message)
    }
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  requestUser = async (accessToken: string) => {
    try {
      const oktokit = this.createOktokit(accessToken)
      return await oktokit.rest.users.getAuthenticated()
    } catch (error) {
      throw new Error("Failed requesting GitHub user info: " + error.message)
    }
  }

  /**
   * `GET /user/orgs`
   *
   * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
   */
  requestUserOrgs = async (accessToken: string) => {
    try {
      const oktokit = this.createOktokit(accessToken)
      return await oktokit.paginate(
        oktokit.rest.orgs.listForAuthenticatedUser,
        { per_page: 100 },
      )
    } catch (error) {
      throw new Error("Failed requesting GitHub user orgs: " + error.message)
    }
  }

  /**
   * `GET /user/teams`
   *
   * [List your teams](https://docs.github.com/en/rest/reference/teams#list-teams-for-the-authenticated-user)
   */
  requestUserTeams = async (accessToken: string) => {
    try {
      const oktokit = this.createOktokit(accessToken)
      return await oktokit.paginate(
        oktokit.rest.teams.listForAuthenticatedUser,
        { per_page: 100 },
      )
    } catch (error) {
      throw new Error("Failed requesting GitHub user teams: " + error.message)
    }
  }

  /**
   * `GET /user/repos`
   *
   * [List your repositories](https://docs.github.com/en/rest/reference/repos#list-repositories-for-the-authenticated-user)
   */
  requestUserRepos = async (accessToken: string) => {
    try {
      const oktokit = this.createOktokit(accessToken)
      return await oktokit.paginate(
        oktokit.rest.repos.listForAuthenticatedUser,
        { per_page: 100 },
      )
    } catch (error) {
      throw new Error(
        "Failed requesting GitHub user repositories: " + error.message,
      )
    }
  }
}
