import got, { GotJSONOptions } from "got"
import { merge as deepAssign } from "lodash"

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
    private readonly isGithubEnterprise: boolean,
    private readonly org: string,
  ) {
  }

  constructGithubHostname(apiPrefix = false): string {
    console.log('IS GITHUB ENTER', this.isGithubEnterprise)
    return `https://${this.isGithubEnterprise ? "git." + this.org : "api.github"}.com` + (apiPrefix ? '/api/v3' : '')
  }
  /**
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](https://bit.ly/2mNSppX).
   */
  requestAccessToken = async (code: string, clientId: string, clientSecret: string) => {
    console.log("JEREMEY requestAccessToken ")
    const url = "https://git.blendlabs.com" + `/login/oauth/access_token`
    const options: GotJSONOptions = {
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      json: true,
    }
    console.log("OPTIONS REQUEST ACCESS TOKEN", options)
    return this.request<OAuth>(url, options)
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  requestUser = async (accessToken: string) => {
    const url = 'https://git.blendlabs.com/api/v3' + `/user`
    const options: GotJSONOptions = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      json: true,
    }
    console.log('requestUser URL', url)
    return this.request<User>(url, options)
  }

  /**
   * `GET /user/orgs`
   *
   * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
   */
  requestUserOrgs = async (accessToken: string) => {
    const url = 'https://git.blendlabs.com/api/v3' + `/user/orgs`
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
