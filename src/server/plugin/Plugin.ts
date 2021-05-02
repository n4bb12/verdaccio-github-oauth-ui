import { AuthCallback, IPluginAuth, IPluginMiddleware } from "@verdaccio/types"
import { Application } from "express"

import { CliFlow, WebFlow } from "../flows"
import { GitHubAuthProvider } from "../github"
import { Auth, Verdaccio } from "../verdaccio"
import { AuthCore } from "./AuthCore"
import { Cache } from "./Cache"
import { Config, validateConfig } from "./Config"
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
  async authenticate(username: string, token: string, callback: AuthCallback) {
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
}
