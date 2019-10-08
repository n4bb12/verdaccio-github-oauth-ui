import chalk from "chalk"
import { Application } from "express"
import globalTunnel from "global-tunnel-ng"
import { get, intersection } from "lodash"
import { SinopiaGithubOAuthCliSupport } from "../cli-support"
import { GithubClient } from "../github"
import {
  Auth,
  AuthCallback,
  AuthPlugin,
  MiddlewarePlugin,
  PackageAccess,
  RemoteUser,
  Storage,
} from "../verdaccio-types"

import { Authorization } from "./Authorization"
import { Callback } from "./Callback"
import { InjectHtml } from "./InjectHtml"
import { getConfig, PluginConfig, pluginName } from "./PluginConfig"

interface UserDetails {
  authToken: string
  orgNames: string[]
  expires: number
}

const cacheTTLms = 1000 * 30 // 30s

function log(...args: any[]) {
  console.log("[github-oauth-ui]", ...args)
}

/**
 * Implements the verdaccio plugin interfaces.
 */
export default class GithubOauthUiPlugin implements MiddlewarePlugin, AuthPlugin {

  private readonly github = new GithubClient(this.config.user_agent,
    getConfig(this.config, "github-enterprise-hostname"),
  )
  private readonly cache: { [username: string]: UserDetails } = {}
  private readonly cliSupport = new SinopiaGithubOAuthCliSupport(this.config, this.stuff)

  constructor(
    private config: PluginConfig,
    private stuff: any,
  ) {
    this.validateConfig(config)
    globalTunnel.initialize()
    console.log("[github-oauth-ui] Proxy config:", globalTunnel.proxyUrl)
  }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application, auth: Auth, storage: Storage) {
    this.cliSupport.register_middlewares(app, auth, storage)

    if (get(this.config, "web.enable", true)) {
      const injectHtml = new InjectHtml()

      app.use(injectHtml.injectAssetsMiddleware)
      app.use(InjectHtml.path, injectHtml.serveAssetsMiddleware)
    }

    const authorization = new Authorization(this.config)
    const callback = new Callback(this.config, auth)

    app.use(Authorization.path, authorization.middleware)
    app.use(Callback.path, callback.middleware)
  }

  /**
   * Implements the auth plugin interface.
   */
  async authenticate(username: string, authToken: string, cb: AuthCallback) {
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
        log(error.message)
      }
    }

    const requiredOrg = process.env[this.config.org] || this.config.org

    if (details && details.orgNames.includes(requiredOrg)) {
      cb(null, details.orgNames)
    } else {
      log(`Unauthenticated: user "${username}" is not a member of "${requiredOrg}"`)
      cb(null, false)
    }
  }

  allow_access(user: RemoteUser, pkg: PackageAccess, cb: AuthCallback): void {
    const requiredAccess = [...pkg.access || []]
    if (requiredAccess.includes("$authenticated")) {
      requiredAccess.push(this.config.auth[pluginName].org)
    }

    const grantedAccess = intersection(user.groups, requiredAccess)

    if (grantedAccess.length === requiredAccess.length) {
      cb(null, user.groups)
    } else {
      log(`Access denied: user "${user.name}" is not a member of "${this.config.org}"`)
      cb(null, false)
    }
  }

  private validateConfig(config: PluginConfig) {
    this.validateConfigProp(config, `auth.${pluginName}.org`)
    this.validateConfigProp(config, `middlewares.${pluginName}.client-id`)
    this.validateConfigProp(config, `middlewares.${pluginName}.client-secret`)
  }

  private validateConfigProp(config: PluginConfig, prop: string) {
    if (!get(config, prop)) {
      console.error(chalk.red(
        `[${pluginName}] ERR: missing configuration "${prop}", please check your verdaccio config`))
      process.exit(1)
    }
  }

}
