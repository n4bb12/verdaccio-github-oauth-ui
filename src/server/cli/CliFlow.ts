import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler } from "express"

import { AuthCore } from "../plugin/AuthCore"
import { AuthProvider } from "../plugin/AuthProvider"
import { logger } from "../plugin/logger"
import { WebFlow } from "../plugin/WebFlow"

const cliAuthorizeUrl = "/oauth/authorize"
const cliCallbackUrl = "http://localhost:8239?token="
const providerId = "sinopia-github-oauth-cli"

const pluginAuthorizeUrl = WebFlow.getAuthorizePath(providerId)
const pluginCallbackeUrl = WebFlow.getCallbackPath(providerId)

export class CliFlow implements IPluginMiddleware<any> {

  constructor(
    private readonly core: AuthCore,
    private readonly provider: AuthProvider,
  ) { }

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.get(cliAuthorizeUrl, this.authorize)
    app.get(pluginCallbackeUrl, this.callback)
  }

  authorize: Handler = (req, res) => {
    res.redirect(pluginAuthorizeUrl)
  }

  callback: Handler = async (req, res, next) => {
    try {
      const code = await this.provider.getCode(req)
      const token = await this.provider.getToken(code)
      const username = await this.provider.getUsername(token)
      const groups = await this.provider.getGroups(token)

      if (this.core.canAuthenticate(username, groups)) {
        const npmToken = this.core.getNpmToken(username, token)
        const frontendUrl = cliCallbackUrl + encodeURIComponent(npmToken)
        res.redirect(frontendUrl)
      } else {
        const errorPage = this.core.getErrorPage(username)
        res.send(errorPage)
      }
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

}
