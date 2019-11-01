import {
  AuthCallback,
  IPluginAuth,
  IPluginMiddleware,
  PackageAccess,
  RemoteUser,
} from "@verdaccio/types"
import { Application } from "express"
import { intersection } from "lodash"

import { CliSupport } from "../cli-support"
import { GitHubAuthProvider } from "../github"
import { Auth } from "../verdaccio"
import { Authorization } from "./Authorization"
import { Cache } from "./Cache"
import { Callback } from "./Callback"
import { Config, getConfig, validateConfig } from "./Config"
import { logger } from "./logger"
import { PatchHtml } from "./PatchHtml"
import { registerGlobalProxyAgent } from "./ProxyAgent"
import { ServeStatic } from "./ServeStatic"

/**
 * Implements the verdaccio plugin interfaces.
 */
export class Plugin implements IPluginMiddleware<any>, IPluginAuth<any> {

  private readonly requiredGroup = getConfig(this.config, "org")
  private readonly provider = new GitHubAuthProvider(this.config)
  private readonly cache = new Cache(this.provider)

  constructor(private readonly config: Config) {
    validateConfig(config)
    registerGlobalProxyAgent()
  }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application, auth: Auth) {
    const plugins = [
      new ServeStatic(),
      new PatchHtml(this.config),
      new CliSupport(this.config, auth),
    ]
    plugins.forEach(plugin => plugin.register_middlewares(app))

    const authorization = new Authorization(this.config, this.provider)
    app.get(Authorization.path(), authorization.middleware)

    const callback = new Callback(this.config, auth, this.provider)
    app.get(Callback.path(), callback.middleware)
  }

  /**
   * Implements the auth plugin interface.
   */
  async authenticate(username: string, authToken: string, callback: AuthCallback) {
    const groups = await this.cache.getGroups(username, authToken)

    if (groups.includes(this.requiredGroup)) {
      callback(null, [this.requiredGroup])
    } else {
      logger.error(`Unauthenticated: user "${username}" is not a member of "${this.requiredGroup}"`)
      callback(null, false)
    }
  }

  allow_access(user: RemoteUser, pkg: PackageAccess, callback: AuthCallback): void {
    const requiredAccess = [...pkg.access || []]

    if (requiredAccess.includes("$authenticated")) {
      requiredAccess.push(this.requiredGroup)
    }

    const grantedAccess = intersection(user.groups, requiredAccess)

    if (grantedAccess.length === requiredAccess.length) {
      callback(null, user.groups)
    } else {
      logger.error(`Access denied: user "${user.name}" is not a member of "${this.config.org}"`)
      callback(null, false)
    }
  }

}
