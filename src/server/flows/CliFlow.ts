import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler } from "express"
import qs from "query-string"

import { cliPort, cliProviderId } from "../../constants"
import { logger } from "../../logger"
import { AuthCore } from "../plugin/AuthCore"
import { AuthProvider } from "../plugin/AuthProvider"
import { Verdaccio } from "../verdaccio"
import { WebFlow } from "./WebFlow"

const pluginCallbackeUrl = WebFlow.getCallbackPath(cliProviderId)

export class CliFlow implements IPluginMiddleware<any> {
  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly core: AuthCore,
    private readonly provider: AuthProvider,
  ) {}

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.get(pluginCallbackeUrl, this.callback)
  }

  callback: Handler = async (req, res) => {
    const params: Record<string, string> = {}

    try {
      const code = await this.provider.getCode(req)
      const token = await this.provider.getToken(code)
      const username = await this.provider.getUsername(token)
      const groups = await this.provider.getGroups(token)

      if (this.core.authenticate(username, groups)) {
        const user = this.core.createAuthenticatedUser(username)
        const npmToken = await this.verdaccio.issueNpmToken(token, user)

        params.status = "success"
        params.token = npmToken
      } else {
        params.status = "denied"
      }
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
