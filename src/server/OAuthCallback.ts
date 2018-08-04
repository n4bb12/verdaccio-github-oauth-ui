import { NextFunction, Request, Response } from "express"
import * as querystring from "querystring"

import { GithubClient } from "./github"
import { Auth } from "./verdaccio"

export class OAuthCallback {

  public static readonly path = "/-/oauth/callback"

  private readonly github = new GithubClient(this.config.user_agent)

  constructor(
    private readonly config: any,
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
  public middleware = async (req: Request, res: Response, next: NextFunction) => {
    const code = req.query.code
    const clientId = this.config["client-id"]
    const clientSecret = this.config["client-secret"]

    try {
      const oauth = await this.github.requestAccessToken(code, clientId, clientSecret)
      const user = await this.github.requestUser(oauth.access_token)

      const npmAuthPayload = user.login + ":" + oauth.access_token
      const npmAuthToken = this.auth.aesEncrypt(new Buffer(npmAuthPayload)).toString("base64")

      const frontendJwtToken = this.auth.issueUIjwt(user.login)
      const frontendUrl = "/?" + querystring.stringify({
        jwtToken: frontendJwtToken,
        npmToken: npmAuthToken,
        username: user.login,
      })

      res.redirect(frontendUrl)
    } catch (error) {
      next(error)
    }
  }

}
