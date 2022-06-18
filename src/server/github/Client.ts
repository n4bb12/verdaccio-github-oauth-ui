import { exchangeWebFlowCode } from "@octokit/oauth-methods"
import { request } from "@octokit/request"
import { Octokit } from "octokit"
import { logger } from "../../logger"

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
   * https://developer.github.com/v3/users/#get-the-authenticated-user
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
   * `GET /orgs/{org}/members/{username}`
   *
   * https://docs.github.com/en/rest/orgs/members#check-organization-membership-for-a-user
   */
  requestOrganizationMembershipStatus = async (
    accessToken: string,
    org: string,
    username: string,
  ) => {
    try {
      const oktokit = this.createOktokit(accessToken)
      const response = await oktokit.rest.orgs.checkMembershipForUser({
        org,
        username,
      })
      return (response.status as number) === 204
    } catch (error) {
      logger.log(
        `Failed requesting GitHub organization "${org}" membership status of user "${username}": ${error.message}`,
      )
      return false
    }
  }

  /**
   * `GET /orgs/{org}/teams/{team}/memberships/{username}`
   *
   * https://docs.github.com/en/rest/teams/members#get-team-membership-for-a-user
   */
  requestTeamMembershipStatus = async (
    accessToken: string,
    org: string,
    team_slug: string,
    username: string,
  ) => {
    try {
      const oktokit = this.createOktokit(accessToken)
      const response = await oktokit.rest.teams.getMembershipForUserInOrg({
        org,
        team_slug,
        username,
      })
      return response.status === 200
    } catch (error) {
      logger.log(
        `Failed requesting GitHub team "${org}/${team_slug}" membership status of user "${username}": ${error.message}`,
      )
      return false
    }
  }

  /**
   * `GET /repos/{owner}/{repo}/collaborators/{username}
   *
   * https://docs.github.com/en/rest/collaborators/collaborators#check-if-a-user-is-a-repository-collaborator
   */
  requestRepositoryCollaboratorStatus = async (
    accessToken: string,
    owner: string,
    repo: string,
    username: string,
  ) => {
    try {
      const oktokit = this.createOktokit(accessToken)
      const response = await oktokit.rest.repos.checkCollaborator({
        owner,
        repo,
        username,
      })
      return response.status === 204
    } catch (error) {
      logger.log(
        `Failed requesting GitHub repository "${owner}/${repo}" membership status of user "${username}": ${error.message}`,
      )
      return false
    }
  }
}
