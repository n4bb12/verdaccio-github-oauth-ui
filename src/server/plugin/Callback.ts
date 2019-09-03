import { Handler, NextFunction, Request, Response } from "express"
import * as querystring from "querystring"

import { GithubClient } from "../github"
import { Auth, User } from "../verdaccio-types"

import { getConfig, PluginConfig } from "./PluginConfig"

export class Callback {

  static readonly path = "/-/oauth/callback"

  private readonly github = new GithubClient(
    this.config.user_agent,
    getConfig(this.config, "github-enterprise-hostname"),
  )

  constructor(
    private readonly config: PluginConfig,
    private readonly auth: Auth,
  ) { }

  /**
   * After a successful OAuth authentication, GitHub redirects back to us.
   * We use the OAuth code to get an OAuth access token and the username associated
   * with the GitHub account.
   *
   * The token and username are encryped and base64 encoded and configured as npm
   * credentials for this registry. There is no need to later decode and decrypt the token.
   * This process is automatically reversed before the token is passed to the authenticate
   * middleware.
   *
   * We then issue a JWT token using these values and pass them back to the frontend
   * as query parameters so they can be stored in the browser.
   */
  middleware: Handler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code
      const clientId = getConfig(this.config, "client-id")
      const clientSecret = getConfig(this.config, "client-secret")

      const githubOauth = await this.github.requestAccessToken(code, clientId, clientSecret)
      const githubUser = await this.github.requestUser(githubOauth.access_token)
      const githubOrgs = await this.github.requestUserOrgs(githubOauth.access_token)
      const githubOrgNames = githubOrgs.map(org => org.login)

      const npmAuth = githubUser.login + ":" + githubOauth.access_token
      const npmAuthEncrypted = this.auth.aesEncrypt(new Buffer(npmAuth)).toString("base64")

      const frontendUser: User = {
        name: githubUser.login,
        real_groups: githubOrgNames,
      }
      const frontendToken = this.auth.issueUIjwt(frontendUser)
      const frontendUrl = "/?" + querystring.stringify({
        jwtToken: frontendToken,
        npmToken: npmAuthEncrypted,
        username: githubUser.login,
      })

      res.redirect(frontendUrl)
    } catch (error) {
      next(error)
    }
  }

}
