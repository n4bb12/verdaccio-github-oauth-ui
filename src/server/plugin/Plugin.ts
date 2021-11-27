import {
  AllowAccess,
  AuthAccessCallback,
  AuthCallback,
  IPluginAuth,
  IPluginMiddleware,
  RemoteUser,
} from "@verdaccio/types"
import { Application } from "express"

import { CliFlow, WebFlow } from "../flows"
import { GitHubAuthProvider } from "../github"
import { Auth, Verdaccio } from "../verdaccio"
import { AuthCore } from "./AuthCore"
import { Cache } from "./Cache"
import { Config, PackageAccess, validateConfig } from "./Config"
import { PatchHtml } from "./PatchHtml"
import { registerGlobalProxyAgent } from "./ProxyAgent"
import { ServeStatic } from "./ServeStatic"

/**
 * Implements the verdaccio plugin interfaces.
 */
export class Plugin implements IPluginMiddleware<any>, IPluginAuth<any> {
  private readonly provider = new GitHubAuthProvider(this.config)
  private readonly cache = new Cache(this.provider)
  private readonly verdaccio = new Verdaccio(this.config)
  private readonly core = new AuthCore(this.verdaccio, this.config)

  constructor(private readonly config: Config) {
    validateConfig(config)
    registerGlobalProxyAgent()
  }

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application, auth: Auth) {
    this.verdaccio.setAuth(auth)

    const children = [
      new ServeStatic(),
      new PatchHtml(this.verdaccio),
      new WebFlow(this.config, this.core, this.provider),
      new CliFlow(this.verdaccio, this.core, this.provider),
    ]

    for (const child of children) {
      child.register_middlewares(app)
    }
  }

  /**
   * IPluginAuth
   */
  async authenticate(
    username: string,
    token: string,
    callback: AuthCallback,
  ): Promise<void> {
    try {
      if (!username || !token) {
        callback(null, false)
        return
      }

      const groups = await this.cache.getGroups(token)

      if (this.core.authenticate(username, groups)) {
        const user = await this.core.createAuthenticatedUser(username, groups)

        callback(null, user.real_groups)
        return
      }

      callback(null, false)
    } catch (error) {
      callback(error, false)
    }
  }

  /**
   * IPluginAuth
   */
  allow_access(
    user: RemoteUser,
    config: AllowAccess & PackageAccess,
    callback: AuthAccessCallback,
  ): void {
    if (config.access) {
      const grant = config.access.some((group) => user.groups.includes(group))
      callback(null, grant)
    } else {
      callback(null, true)
    }
  }

  /**
   * IPluginAuth
   */
  allow_publish(
    user: RemoteUser,
    config: AllowAccess & PackageAccess,
    callback: AuthAccessCallback,
  ): void {
    if (config.publish) {
      const grant = config.publish.some((group) => user.groups.includes(group))
      callback(null, grant)
    } else {
      this.allow_access(user, config, callback)
    }
  }

  /**
   * IPluginAuth
   */
  allow_unpublish(
    user: RemoteUser,
    config: AllowAccess & PackageAccess,
    callback: AuthAccessCallback,
  ): void {
    if (config.unpublish) {
      const grant = config.unpublish.some((group) =>
        user.groups.includes(group),
      )
      callback(null, grant)
    } else {
      this.allow_publish(user, config, callback)
    }
  }
}
