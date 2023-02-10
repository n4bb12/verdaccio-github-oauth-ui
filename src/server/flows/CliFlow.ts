import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler, Request } from "express"
import qs from "query-string"
import { cliPort, cliProviderId } from "../../constants"
import { logger } from "../../logger"
import { getCallbackPath } from "../../redirect"
import { AuthCore } from "../plugin/AuthCore"
import { AuthProvider } from "../plugin/AuthProvider"
import { Verdaccio } from "../plugin/Verdaccio"
import { ParsedPluginConfig } from "../plugin/Config"
import { getPublicUrl } from "@verdaccio/url"

const pluginCallbackeUrl = getCallbackPath(cliProviderId)

export class CliFlow implements IPluginMiddleware<any> {
  constructor(
    private readonly config: ParsedPluginConfig,
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
      const userToken = await this.provider.getToken(
        code,
        this.getRedirectUrl(req),
      )
      const userName = await this.provider.getUserName(userToken)
      const userGroups = await this.provider.getGroups(userToken, userName)
      const user = await this.core.createAuthenticatedUser(userName, userGroups)
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

  private getRedirectUrl(req: Request): string {
    const baseUrl = getPublicUrl(this.config.url_prefix, {
      host: req.hostname,
      headers: req.headers as any,
      protocol: req.protocol,
    }).replace(/\/$/, "")
    const redirectUrl = baseUrl + pluginCallbackeUrl

    return redirectUrl
  }
}
