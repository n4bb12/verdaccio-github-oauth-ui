import * as got from "got"
import { merge as deepAssign } from "lodash"

import { OAuth } from "./OAuth"
import { Organization } from "./Organization"
import { User } from "./User"

export function constructGithubHostname(isGithubEnterprise: boolean, org: string, routePrefix = ""): string {
  return `https://${isGithubEnterprise ? "git." + org : "github"}.com${isGithubEnterprise ? routePrefix : ""}`
}

const API_V3_PREFIX = "/api/v3"
export class GithubClient {
  private readonly defaultOptions = {
    headers: {
      "User-Agent": this.userAgent,
    },
    json: true,
  }

  constructor(
    private readonly userAgent: string,
    private readonly isGithubEnterprise: boolean,
    private readonly org: string,
  ) { }
  /**
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](https://bit.ly/2mNSppX).
   */
  requestAccessToken = async (code: string, clientId: string, clientSecret: string) => {
    const url = `${this.constructGithubClientHostname()}/login/oauth/access_token`
    const options: got.GotJSONOptions = {
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
    const url = `${this.constructGithubClientHostname(API_V3_PREFIX)}/user`
    const options: got.GotJSONOptions = {
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
    const url = `${this.constructGithubClientHostname(API_V3_PREFIX)}/user/orgs`
    const options: got.GotJSONOptions = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      json: true,
    }
    return this.request<Organization[]>(url, options)
  }

  private constructGithubClientHostname(routePrefix = "") {
    return constructGithubHostname(this.isGithubEnterprise, this.org, routePrefix)
  }

  private async request<T>(url: string, options: got.GotJSONOptions): Promise<T> {
    options = deepAssign({}, this.defaultOptions, options)
    const response = await got(url, options)
    return response.body
  }

}
