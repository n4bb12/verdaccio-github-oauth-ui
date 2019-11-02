import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler, Response } from "express"

import { Authorization } from "../plugin/Authorization"
import { AuthProvider } from "../plugin/AuthProvider"
import { Callback } from "../plugin/Callback"
import { Config, getConfig } from "../plugin/Config"
import { logger } from "../plugin/logger"
import { Auth } from "../verdaccio"

const cliAuthorizeUrl = "/oauth/authorize"
const cliCallbackUrl = "http://localhost:8239?token="
const pluginOAuthId = "sinopia-github-oauth-cli"

const pluginAuthorizeUrl = Authorization.path(pluginOAuthId)
const pluginCallbackeUrl = Callback.path(pluginOAuthId)

export class CliSupport implements IPluginMiddleware<any> {

  private readonly requiredGroup = getConfig(this.config, "org")

  constructor(
    private readonly config: Config,
    private readonly provider: AuthProvider,
    private readonly verdaccioAuth: Auth,
  ) { }

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.get(cliAuthorizeUrl, this.authorize)
    app.get(pluginCallbackeUrl, this.receiveOAuthCode)
  }

  authorize: Handler = (req, res) => {
    res.redirect(pluginAuthorizeUrl)
  }

  receiveOAuthCode: Handler = async (req, res, next) => {
    try {
      const code = await this.provider.getCode(req)
      const token = await this.provider.getToken(code)
      const username = await this.provider.getUsername(token)
      const groups = await this.provider.getGroups(token)

      if (groups.includes(this.requiredGroup)) {
        this.grantAccess(res, token, username)
      } else {
        this.denyAccess(res, username)
      }
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  private grantAccess(res: Response, token: string, username: string) {
    const npmAuth = username + ":" + token
    const npmToken = this.encrypt(npmAuth)

    const frontendUrl = cliCallbackUrl + encodeURIComponent(npmToken)

    res.redirect(frontendUrl)
  }

  private denyAccess(res: Response, username: string) {
    logger.error(`Access denied: user "${username}" is not a member of "${this.requiredGroup}"`)
    res.send(`Access denied: you are not a member of "${this.requiredGroup}"<br><a href="/">Go back</a>`)
  }

  private encrypt(text: string) {
    return this.verdaccioAuth.aesEncrypt(new Buffer(text)).toString("base64")
  }

}
