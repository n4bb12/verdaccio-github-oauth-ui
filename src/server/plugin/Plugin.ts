import {
  IPluginAuth,
  IPluginMiddleware,
  PackageAccess,
  RemoteUser,
} from "@verdaccio/types"
import chalk from "chalk"
import { Application } from "express"
import globalTunnel from "global-tunnel-ng"
import { get, intersection } from "lodash"

import { SinopiaGithubOAuthCliSupport } from "../cli-support"
import { GithubClient } from "../github"
import { Auth, AuthCallback } from "../verdaccio-types"

import { Authorization } from "./Authorization"
import { Callback } from "./Callback"
import { InjectHtml } from "./InjectHtml"
import { getConfig, PluginConfig, pluginName } from "./PluginConfig"

interface UserDetails {
  authToken: string
  orgNames: string[]
  expires: number
}

const cacheTTLms = 1000 * 5 // 5s

function log(...args: any[]) {
  console.log("[github-oauth-ui]", ...args)
}

/**
 * Implements the verdaccio plugin interfaces.
 */
export default class GithubOauthUiPlugin implements IPluginMiddleware<any>, IPluginAuth<any> {

  private readonly github = new GithubClient(this.config.user_agent,
    getConfig(this.config, "github-enterprise-hostname"),
  )
  private readonly cache: { [username: string]: UserDetails } = {}
  private readonly cliSupport = new SinopiaGithubOAuthCliSupport(this.config)

  constructor(private readonly config: PluginConfig) {
    this.validateConfig(config)
    globalTunnel.initialize()
    console.log("[github-oauth-ui] Proxy config:", globalTunnel.proxyUrl)
  }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application, auth: Auth) {
    this.cliSupport.register_middlewares(app, auth)

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
    const userOrgs = await this.getOrgNames(username, authToken)
    const requiredOrg = getConfig(this.config, "org")

    if (userOrgs.includes(requiredOrg)) {
      cb(null, [requiredOrg])
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

  private async getOrgNames(username: string, authToken: string): Promise<string[]> {
    const invalidate = () => delete this.cache[username]
    const cached = () => this.cache[username] || {}
    const nearFuture = () => Date.now() + cacheTTLms

    if (cached().authToken !== authToken) {
      invalidate()
    }
    if (cached().expires < Date.now()) {
      invalidate()
    } else {
      cached().expires = nearFuture()
    }

    if (!cached().orgNames) {
      try {
        const orgs = await this.github.requestUserOrgs(authToken)
        const orgNames = orgs.map(org => org.login)

        this.cache[username] = {
          authToken,
          orgNames,
          expires: nearFuture(),
        }
      } catch (error) {
        log(error.message)
      }
    }

    return cached().orgNames || []
  }

  private validateConfig(config: PluginConfig) {
    this.validateConfigProp(config, "org")
    this.validateConfigProp(config, "client-id")
    this.validateConfigProp(config, "client-secret")
  }

  private validateConfigProp(config: PluginConfig, name: string) {
    const pathA = `auth.${pluginName}.${name}`
    const pathB = `middlewares.${pluginName}.${name}`

    if (get(config, pathA) || get(config, pathB)) {
      return
    }

    console.error(chalk.red(
      `[${pluginName}] ERR: Missing configuration "${pathA}". Please check your verdaccio config.`))
    process.exit(1)
  }

}
