import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler, Request } from "express"
import { getPublicUrl } from "verdaccio/build/lib/utils"

import { logger } from "../../logger"
import { getAuthorizePath, getCallbackPath } from "../../redirect"
import { buildAccessDeniedPage, buildErrorPage } from "../../statusPage"
import { AuthCore } from "../plugin/AuthCore"
import { AuthProvider } from "../plugin/AuthProvider"
import { ParsedPluginConfig } from "../plugin/Config"

export class WebFlow implements IPluginMiddleware<any> {
  constructor(
    private readonly config: ParsedPluginConfig,
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
    const withBackButton = true

    try {
      const code = this.provider.getCode(req)
      const token = await this.provider.getToken(code)
      const [username, groups] = await Promise.all([
        this.provider.getUsername(token),
        this.provider.getGroups(token),
      ])

      if (this.core.authenticate(username, groups)) {
        const ui = await this.core.createUiCallbackUrl(username, token, groups)

        res.redirect(ui)
      } else {
        res.status(401).send(buildAccessDeniedPage(withBackButton))
      }
    } catch (error) {
      logger.error(error)

      res.status(500).send(buildErrorPage(error, withBackButton))
    }
  }

  private getRedirectUrl(req: Request): string {
    const baseUrl = getPublicUrl(this.config.url_prefix, req).replace(/\/$/, "")
    const path = getCallbackPath(req.params.id)
    const redirectUrl = baseUrl + path

    return redirectUrl
  }
}
