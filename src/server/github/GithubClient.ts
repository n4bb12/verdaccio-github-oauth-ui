import got, { GotJSONOptions } from "got"
import { merge as deepAssign, trimStart } from "lodash"

import { OAuth } from "./OAuth"
import { Organization } from "./Organization"
import { User } from "./User"

export class GithubClient {

  private readonly defaultOptions = {
    headers: {
      "User-Agent": this.userAgent,
    },
    json: true,
  }

  constructor(
    private readonly userAgent: string,
    private readonly githubEnterpriseHostname?: string,
  ) {
    this.githubEnterpriseHostname = trimStart(githubEnterpriseHostname, "https://")
  }

  constructGithubAPIHostname(): string {
    return (
      "https://"
      + (this.githubEnterpriseHostname ? this.githubEnterpriseHostname : "api.github.com")
      + (this.githubEnterpriseHostname ? "/api/v3" : "")
    )
  }

  constructGithubUIHostname(): string {
    return "https://"
    + (this.githubEnterpriseHostname ? this.githubEnterpriseHostname : "github.com")
  }
  /**
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](https://bit.ly/2mNSppX).
   */
  requestAccessToken = async (code: string, clientId: string, clientSecret: string) => {
    const url = this.constructGithubUIHostname() + "/login/oauth/access_token"
    const options: GotJSONOptions = {
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      json: true,
    }
    return this.request<OAuth>(url, options)
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  requestUser = async (accessToken: string) => {
    const url = this.constructGithubAPIHostname() + "/user"
    const options: GotJSONOptions = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      json: true,
    }
    return this.request<User>(url, options)
  }

  /**
   * `GET /user/orgs`
   *
   * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
   */
  requestUserOrgs = async (accessToken: string) => {
    const url = this.constructGithubAPIHostname() + "/user/orgs"
    const options: GotJSONOptions = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      json: true,
    }
    return this.request<Organization[]>(url, options)
  }

  private async request<T>(url: string, options: GotJSONOptions): Promise<T> {
    options = deepAssign({}, this.defaultOptions, options)
    const response = await got(url, options)
    return response.body
  }

}
