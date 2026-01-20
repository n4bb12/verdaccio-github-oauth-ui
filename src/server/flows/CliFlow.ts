import { Application, Handler } from "express"
import qs from "query-string"
import { cliPort, cliProviderId } from "../../constants"
import { logger } from "../../logger"
import { getCallbackPath } from "../../redirect"
import { AuthCore } from "../plugin/AuthCore"
import { AuthProvider } from "../plugin/AuthProvider"
import { Verdaccio } from "../plugin/Verdaccio"
import { IPluginMiddleware } from "../helpers"

const pluginCallbackeUrl = getCallbackPath(cliProviderId)

export class CliFlow implements IPluginMiddleware {
  private readonly verdaccio: Verdaccio
  private readonly core: AuthCore
  private readonly provider: AuthProvider

  constructor(verdaccio: Verdaccio, core: AuthCore, provider: AuthProvider) {
    this.verdaccio = verdaccio
    this.core = core
    this.provider = provider
  }

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.get(pluginCallbackeUrl, this.callback)
  }

  callback: Handler = async (req, res) => {
    const params: Record<string, string> = {}

    try {
      const code = this.provider.getCode(req)
      const userToken = await this.provider.getToken(code)
      const userName = await this.provider.getUserName(userToken)
      const user = await this.core.createAuthenticatedUser(userName)
      const npmToken = await this.verdaccio.issueNpmToken(user, userToken)

      params.status = "success"
      params.token = encodeURIComponent(npmToken)
    } catch (error) {
      logger.error(error)

      params.status = "error"
      params.message = error.message || error
    }

    const redirectUrl =
      `http://localhost:${cliPort}` + "?" + qs.stringify(params)

    res.redirect(redirectUrl)
  }
}
