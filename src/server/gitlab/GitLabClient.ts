import got, { GotJSONOptions } from "got"
import { merge } from "lodash"
import { stringify } from "query-string"

import { GitLabOAuth } from "./OAuth"
import { GitLabGroup } from "./Group"
import { GitLabUser } from "./User"

export class GitLabClient {

  private readonly defaultOptions = {
    json: true,
  }

  constructor(
    private readonly gitlabHost?: string,
  ) { }

  get webBaseUrl(): string {
    return this.gitlabHost || "https://gitlab.com"
  }

  get apiBaseUrl(): string {
    return this.webBaseUrl.replace(/\/?$/, "") + "/api/v4"
  }

  getAuthorizationUrl = (clientId: string, redirectUri: string) => {
    const query = {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "read_user openid",
    }

    return this.webBaseUrl + `/oauth/authorize?` + stringify(query).replace('%20', '+')
  }

  /**
   * `POST /oauth/token`
   */
  requestAccessToken = async (code: string, clientId: string, clientSecret: string, redirect_uri: string) => {
    const url = this.webBaseUrl + "/oauth/token"
    const options = {
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code"
      },
    }
    return this.request<GitLabOAuth>(url, options)
  }

  /**
   * `GET /user`
   */
  requestUser = async (accessToken: string) => {
    const url = this.apiBaseUrl + "/user"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
    return this.request<GitLabUser>(url, options)
  }

  /**
   * `GET /groups`
   */
  requestUserGroups = async (accessToken: string) => {
    const url = this.apiBaseUrl + "/groups"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
    return this.request<GitLabGroup[]>(url, options)
  }

  private async request<T>(url: string, additionalOptions: Partial<GotJSONOptions>): Promise<T> {
    const options = merge({}, this.defaultOptions, additionalOptions)
    const response = await got(url, options)
    return response.body
  }

}
