import {
  AuthCallback,
  IPluginAuth,
  IPluginMiddleware,
  PackageAccess,
  RemoteUser,
} from "@verdaccio/types"
import { Application } from "express"
import { intersection } from "lodash"

import { SinopiaGithubOAuthCliSupport } from "../cli-support"
import { GitHubAuthProvider } from "../github"
import { Auth } from "../verdaccio"
import { Authorization } from "./Authorization"
import { Callback } from "./Callback"
import { getConfig, PluginConfig, pluginName, validateConfig } from "./Config"
import { PatchHtml } from "./PatchHtml"
import { registerGlobalProxyAgent } from "./ProxyAgent"
import { ServeStatic } from "./ServeStatic"

interface UserDetails {
  token: string
  groups: string[]
  expires: number
}

const cacheTTLms = 1000 * 5 // 5s

function log(...args: any[]) {
  console.log(`${[pluginName]}`, ...args)
}

/**
 * Implements the verdaccio plugin interfaces.
 */
export class GithubOauthUiPlugin implements IPluginMiddleware<any>, IPluginAuth<any> {

  private readonly requiredGroup = getConfig(this.config, "org")
  private readonly provider = new GitHubAuthProvider(this.config)
  private readonly cache: { [username: string]: UserDetails } = {}

  constructor(private readonly config: PluginConfig) {
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
      new SinopiaGithubOAuthCliSupport(this.config, auth),
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
    const groups = await this.getGroups(username, authToken)

    if (groups.includes(this.requiredGroup)) {
      callback(null, [this.requiredGroup])
    } else {
      log(`Unauthenticated: user "${username}" is not a member of "${this.requiredGroup}"`)
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
      log(`Access denied: user "${user.name}" is not a member of "${this.config.org}"`)
      callback(null, false)
    }
  }

  private async getGroups(username: string, token: string): Promise<string[]> {
    const invalidate = () => delete this.cache[username]
    const cached = () => this.cache[username] || {}
    const nearFuture = () => Date.now() + cacheTTLms

    if (cached().token !== token) {
      invalidate()
    }
    if (cached().expires < Date.now()) {
      invalidate()
    } else {
      cached().expires = nearFuture()
    }

    if (!cached().groups) {
      try {
        this.cache[username] = {
          token,
          groups: await this.provider.getGroups(token),
          expires: nearFuture(),
        }
      } catch (error) {
        log(error.message)
      }
    }

    return cached().groups || []
  }

}
