import * as _ from 'lodash'
import { Handler, NextFunction, Request, Response } from "express"
import * as querystring from "querystring"

import { RemoteUser } from "@verdaccio/types"
import { GithubClient } from "../github"
import { AuthWebUI } from "../verdaccio-types"

import { getConfig, PluginConfig } from "./PluginConfig"

export class Callback {

  static readonly path = "/-/oauth/callback"

  private readonly github = new GithubClient(
    this.config.user_agent,
    _.get(this.config, ['auth', "github-oauth-ui", "isGithubEnterprise"]),
    this.config.org,
  )

  constructor(
    private readonly config: PluginConfig,
    private readonly auth: AuthWebUI,
  ) { }

  /**
   * After a successful OAuth authentication, GitHub redirects back to us.
   * We use the OAuth code to get an OAuth access token and the username associated
   * with the GitHub account./-/oauth/authorize
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
      console.log('CALLBACK START, code', code);
      const githubOauth = await this.github.requestAccessToken(code, clientId, clientSecret)
      console.log('CALLBACK MIDDLEWARE githubOauth', githubOauth);
      const githubUser = await this.github.requestUser(githubOauth.access_token)
      console.log('CALLBACK MIDDLEWARE githubUser', githubUser);

      const githubOrgs = await this.github.requestUserOrgs(githubOauth.access_token)
      console.log('CALLBACK MIDDLEWARE githubOrgs', githubOrgs);

      const githubOrgNames = githubOrgs.map(org => org.login)

      console.log("githubOauth ***", githubOauth)
      console.log("githubUser ***", githubUser)
      console.log("githubOrgs ***", githubOrgs)
      console.log("githubOrgNames ***", githubOrgNames)

      const npmAuth = githubUser.login + ":" + githubOauth.access_token
      const npmAuthEncrypted = this.auth.aesEncrypt(new Buffer(npmAuth)).toString("base64")

      const frontendUser: RemoteUser = {
        name: githubUser.login,
        groups: githubOrgNames,
        real_groups: githubOrgNames,
      }
      console.log("frontendUser ***", frontendUser)
      const frontendToken = await this.auth.jwtEncrypt(frontendUser)
      console.log('frontendToken *** ', frontendToken)
      const frontendUrl = "/?" + querystring.stringify({
        jwtToken: frontendToken,
        npmToken: npmAuthEncrypted,
        username: githubUser.login,
      })
      console.log('frontendUrl ***', frontendUrl)      
      // this.auth.authenticate(githubUser.login, githubOauth.access_token, () => res.redirect(frontendUrl))
      res.redirect(frontendUrl)
      // console.log('REDIRECT WORKED', redirectRes)
    } catch (error) {
      console.log('REDIRECT NOT WORKED')

      next(error)
    }
  }

}
