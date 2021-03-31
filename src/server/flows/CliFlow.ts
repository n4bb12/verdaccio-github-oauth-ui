import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler } from "express"
import qs from "query-string"

import { cliPort, cliProviderId } from "../../constants"
import { logger } from "../../logger"
import { getCallbackPath } from "../../redirect"
import { AuthCore } from "../plugin/AuthCore"
import { AuthProvider } from "../plugin/AuthProvider"
import { Verdaccio } from "../verdaccio"
import { getConfig } from "../plugin/Config"

const pluginCallbackeUrl = getCallbackPath(cliProviderId)

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
      const code = this.provider.getCode(req)

      const token = await this.provider.getToken(code)
      const username = await this.provider.getUsername(token)
      const groups = await this.provider.getGroups(token)
      const teams = await this.provider.getTeams(username, getConfig(this.provider.getConf(), "org"), token)

      if (this.core.authenticate(username, groups, teams)) {
        const user = this.core.createAuthenticatedUser(username, teams)
        const npmToken = await this.verdaccio.issueNpmToken(token, user)

        params.status = "success"
        params.token = encodeURIComponent(npmToken)
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
