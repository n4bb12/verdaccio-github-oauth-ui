import * as got from 'got'
import { merge as deepAssign } from 'lodash'

import { OAuth } from './OAuth'
import { Organization } from './Organization'
import { User } from './User'

export class GithubClient {

  private readonly defaultOptions = {
    headers: {
      'User-Agent': this.userAgent,
    },
    json: true,
  }

  constructor(
    private readonly userAgent: string,
  ) { }

  /**
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](https://bit.ly/2mNSppX).
   */
  public requestAccessToken = async (code: string, clientId: string, clientSecret: string) => {
    const url = 'https://github.com/login/oauth/access_token'
    const options = {
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    }
    return this.request<OAuth>(url, options)
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  public requestUser = async (accessToken: string) => {
    const url = 'https://api.github.com/user'
    const options = {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    }
    return this.request<User>(url, options)
  }

  /**
   * `GET /user/orgs`
   *
   * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
   */
  public requestUserOrgs = async (accessToken: string) => {
    const url = 'https://api.github.com/user/orgs'
    const options = {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    };
    return this.request<Organization[]>(url, options)
  }

  private async request<T>(url: string, options: any): Promise<T> {
    options = deepAssign({}, this.defaultOptions, options)
    const response = await got(url, options)
    return response.body
  }

}
