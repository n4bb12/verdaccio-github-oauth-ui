import { Application } from 'express'
import { get } from 'lodash'

import { GithubClient } from './github'
import { InjectHtml } from './InjectHtml'
import { OAuthAuthorize } from './OAuthAuthorize'
import { OAuthCallback } from './OAuthCallback'
import { Auth, AuthCallback, AuthPlugin, MiddlewarePlugin } from './verdaccio'

interface UserDetails {
  authToken: string
  orgNames: string[]
  expires: number
}

const cacheTTLms = 1000 * 30

export default class GithubOauthUiPlugin implements MiddlewarePlugin, AuthPlugin {

  private readonly github = new GithubClient(this.config.user_agent)
  private readonly cache: { [username: string]: UserDetails } = {}

  constructor(
    private config,
    private stuff,
  ) { }

  /**
   * Implements the middleware plugin interface.
   */
  public register_middlewares(app: Application, auth: Auth, storage) {
    if (get(this.config, 'web.enable', true)) {
      const injectHtml = new InjectHtml()

      app.use(injectHtml.injectMiddleware)
      app.use(InjectHtml.path, injectHtml.serveMiddleware)
    }

    const oauthCallback = new OAuthCallback(this.config, auth)
    const oauthAuthorize = new OAuthAuthorize(this.config)

    app.use(OAuthAuthorize.path, oauthAuthorize.middleware)
    app.use(OAuthCallback.path, oauthCallback.middleware)
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
