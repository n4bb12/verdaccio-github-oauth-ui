import got from "got"

import { GitHubOAuth } from "./OAuth"
import { GitHubOrganization } from "./Organization"
import { GitHubRepo } from "./Repo"
import { GitHubTeam } from "./Team"
import { GitHubUser } from "./User"

export class GitHubClient {
  constructor(
    private readonly webBaseUrl: string,
    private readonly apiBaseUrl: string,
  ) {}

  /**a
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](bit.ly/2mNSppX).
   */
  requestAccessToken = async (
    code: string,
    clientId: string,
    clientSecret: string,
  ): Promise<GitHubOAuth> => {
    const url = this.webBaseUrl + "/login/oauth/access_token"
    const options = {
      method: "POST",
      json: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    } as const

    try {
      return await got(url, options).json()
    } catch (error) {
      throw new Error("Failed requesting GitHub access token: " + error.message)
    }
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  requestUser = async (accessToken: string): Promise<GitHubUser> => {
    const url = this.apiBaseUrl + "/user"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const

    try {
      return await got(url, options).json()
    } catch (error) {
      throw new Error("Failed requesting GitHub user info: " + error.message)
    }
  }

  /**
   * `GET /user/orgs`
   *
   * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
   */
  requestUserOrgs = async (
    accessToken: string,
  ): Promise<GitHubOrganization[]> => {
    const url = this.apiBaseUrl + "/user/orgs"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const

    try {
      return await got(url, options).json()
    } catch (error) {
      throw new Error("Failed requesting GitHub user orgs: " + error.message)
    }
  }

  /**
   * `GET /user/teams`
   *
   * [List your teams](https://docs.github.com/en/rest/reference/teams#list-teams-for-the-authenticated-user)
   */
  requestUserTeams = async (accessToken: string): Promise<GitHubTeam[]> => {
    const url = this.apiBaseUrl + "/user/teams"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const

    try {
      return await got(url, options).json()
    } catch (error) {
      throw new Error("Failed requesting GitHub user teams: " + error.message)
    }
  }

  /**
   * `GET /user/repos`
   *
   * [List your repositories](https://docs.github.com/en/rest/reference/repos#list-repositories-for-the-authenticated-user)
   */
  requestUserRepos = async (accessToken: string): Promise<GitHubRepo[]> => {
    const url = this.apiBaseUrl + "/user/repos"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const

    try {
      return await got(url, options).json()
    } catch (error) {
      throw new Error(
        "Failed requesting GitHub user repositories: " + error.message,
      )
    }
  }
}
