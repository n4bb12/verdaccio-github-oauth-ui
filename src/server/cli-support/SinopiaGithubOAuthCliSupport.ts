import { IPluginMiddleware } from "@verdaccio/types"
import { Application, NextFunction, Request, Response } from "express"
import { stringify } from "querystring"

import { GitHubAuthProvider } from "../github"
import { Authorization } from "../plugin/Authorization"
import { Callback } from "../plugin/Callback"
import { PluginConfig } from "../plugin/Config"
import { Auth } from "../verdaccio"

const cliAuthorizeUrl = "/oauth/authorize"
const cliCallbackUrl = "http://localhost:8239"
const pluginOAuthId = "sinopia-github-oauth-cli"

export class SinopiaGithubOAuthCliSupport implements IPluginMiddleware<any> {

  private readonly provider = new GitHubAuthProvider(this.config)

  constructor(
    private readonly config: PluginConfig,
    private readonly auth: Auth,
  ) { }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application) {
    app.get(cliAuthorizeUrl, (req: Request, res: Response) => {
      res.redirect(Authorization.path(pluginOAuthId))
    })

    app.get(Callback.path(pluginOAuthId), async (req: Request, res: Response, next: NextFunction) => {
      try {
        const code = req.query.code

        const token = await this.provider.getToken(code)
        const username = await this.provider.getUsername(token)

        const npmAuth = username + ":" + token
        const encryptedNpmToken = this.encrypt(npmAuth)

        const query = { token: encodeURIComponent(encryptedNpmToken) }
        const url = cliCallbackUrl + "?" + stringify(query)

        res.redirect(url)
      } catch (error) {
        next(error)
      }
    })
  }

  private encrypt(text: string) {
    return this.auth.aesEncrypt(new Buffer(text)).toString("base64")
  }

}
