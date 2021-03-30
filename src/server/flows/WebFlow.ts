import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler, Request } from "express"

import { logger } from "../../logger"
import { getAuthorizePath, getCallbackPath } from "../../redirect"
import { buildAccessDeniedPage, buildErrorPage } from "../../statusPage"
import { AuthCore } from "../plugin/AuthCore"
import { AuthProvider } from "../plugin/AuthProvider"
import { Verdaccio } from "../verdaccio"
import { getConfig } from "../plugin/Config"

export class WebFlow implements IPluginMiddleware<any> {
  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly core: AuthCore,
    private readonly provider: AuthProvider,
  ) {}

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.get(getAuthorizePath(), this.authorize)
    app.get(getCallbackPath(), this.callback)
  }

  /**
   * Initiates the auth flow by redirecting to the provider's login URL.
   */
  authorize: Handler = async (req, res, next) => {
    try {
      const redirectUrl = this.getRedirectUrl(req)
      const url = this.provider.getLoginUrl(redirectUrl)
      res.redirect(url)
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  /**
   * After successful authentication, the auth provider redirects back to us.
   * We use the code in the query params to get an access token and the username
   * associated with the account.
   *
   * We issue a JWT using these values and pass them back to the frontend as
   * query parameters so they can be stored in the browser.
   *
   * The username and token are encrypted and base64 encoded to form a token for
   * the npm CLI.
   *
   * There is no need to later decode and decrypt the token. This process is
   * automatically reversed by verdaccio before passing it to the plugin.
   */
  callback: Handler = async (req, res) => {
    try {
      const code = this.provider.getCode(req)

      const token = await this.provider.getToken(code)
      const username = await this.provider.getUsername(token)
      const groups = await this.provider.getGroups(token)
      const teams = await this.provider.getTeams(
        username,
        getConfig(this.provider.getConf(), "org"),
        token,
      )

      if (this.core.authenticate(username, groups, teams)) {
        const ui = await this.core.createUiCallbackUrl(token, username)

        res.redirect(ui)
      } else {
        res.status(401).send(buildAccessDeniedPage())
      }
    } catch (error) {
      logger.error(error)

      res.status(500).send(buildErrorPage(error))
    }
  }

  private getRequestOrigin(req: Request) {
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return protocal + "://" + req.get("host")
  }

  private getRedirectUrl(req: Request): string {
    const baseUrl = this.verdaccio.baseUrl || this.getRequestOrigin(req)
    const path = getCallbackPath(req.params.id)
    return baseUrl + path
  }
}
