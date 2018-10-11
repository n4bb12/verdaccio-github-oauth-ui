import { Application } from "express"
import { get } from "lodash"

import { SinopiaGithubOAuthCliSupport } from "../cli-support"
import { GithubClient } from "../github"
import {
  Auth,
  AuthCallback,
  AuthPlugin,
  MiddlewarePlugin,
  Storage,
} from "../verdaccio"

import { AuthorizeMiddleware } from "./AuthorizeMiddleware"
import { CallbackMiddleware } from "./CallbackMiddleware"
import { InjectHtml } from "./InjectHtml"

interface UserDetails {
  authToken: string
  orgNames: string[]
  expires: number
}

const cacheTTLms = 1000 * 30

export default class GithubOauthUiPlugin implements MiddlewarePlugin, AuthPlugin {

  private readonly github = new GithubClient(this.config.user_agent)
  private readonly cache: { [username: string]: UserDetails } = {}
  private readonly cliSupport = new SinopiaGithubOAuthCliSupport(this.config, this.stuff)

  constructor(
    private config: any,
    private stuff: any,
  ) { }

  /**
   * Implements the middleware plugin interface.
   */
  public register_middlewares(app: Application, auth: Auth, storage: Storage) {
    this.cliSupport.register_middlewares(app, auth, storage)

    if (get(this.config, "web.enable", true)) {
      const injectHtml = new InjectHtml()

      app.use(injectHtml.injectMiddleware)
      app.use(InjectHtml.path, injectHtml.serveMiddleware)
    }

    const authorizeMiddleware = new AuthorizeMiddleware(this.config)
    const callbackMiddleware = new CallbackMiddleware(this.config, auth)

    app.use(AuthorizeMiddleware.path, authorizeMiddleware.middleware)
    app.use(CallbackMiddleware.path, callbackMiddleware.middleware)
  }

  /**
   * Implements the auth plugin interface.
   */
  public async authenticate(username: string, authToken: string, cb: AuthCallback) {
    let details = this.cache[username]

    if (!details || details.authToken !== authToken || details.expires > Date.now()) {
      try {
        const orgs = await this.github.requestUserOrgs(authToken)
        const orgNames = orgs.map(org => org.login)

        details = this.cache[username] = {
          authToken,
          expires: Date.now() + cacheTTLms,
          orgNames,
        }
      } catch (error) {
        cb(error, false)
      }
    }

    if (details.orgNames.includes(this.config.org)) {
      cb(null, details.orgNames)
    } else {
      cb(`User "${username}" is not a member of "${this.config.org}"`, false)
    }
  }

}
