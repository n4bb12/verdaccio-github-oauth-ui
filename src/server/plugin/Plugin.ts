import {
  AuthCallback,
  IPluginAuth,
  IPluginMiddleware,
  PackageAccess,
  RemoteUser,
} from "@verdaccio/types"
import { Application } from "express"
import { get, intersection } from "lodash"

import { GitlabOAuthCliSupport } from "../cli-support"
import { GitLabClient } from "../gitlab"
import { Auth } from "../verdaccio"
import { Authorization } from "./Authorization"
import { Callback } from "./Callback"
import { getConfig, PluginConfig, pluginName, validateConfig } from "./Config"
import { InjectHtml } from "./InjectHtml"
import { registerGlobalProxyAgent } from "./ProxyAgent"

interface UserDetails {
  authToken: string
  groupNames: string[]
  expires: number
}

const cacheTTLms = 1000 * 5 // 5s

function log(...args: any[]) {
  console.log(`${[pluginName]}`, ...args)
}

/**
 * Implements the verdaccio plugin interfaces.
 */
export class GitlabOauthUiPlugin implements IPluginMiddleware<any>, IPluginAuth<any> {

  private readonly requiredGroup = getConfig(this.config, "group")
  private readonly gitlabHost = getConfig(this.config, "gitlab-host")
  private readonly gitlab = new GitLabClient(this.gitlabHost)
  private readonly cache: { [username: string]: UserDetails } = {}

  constructor(private readonly config: PluginConfig) {
    validateConfig(config)
    registerGlobalProxyAgent()
  }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application, auth: Auth) {
    if (get(this.config, "web.enable", true)) {
      const injectHtml = new InjectHtml(this.config)

      app.use(injectHtml.injectAssetsMiddleware)
      app.use(InjectHtml.path, injectHtml.serveAssetsMiddleware)
    }

    const cliSupport = new GitlabOAuthCliSupport(this.config, auth)
    cliSupport.register_middlewares(app)
    const authorization = new Authorization(this.config)
    app.get(Authorization.path, authorization.middleware)

    const callback = new Callback(this.config, auth)
    app.get(Callback.path, callback.middleware)
  }

  /**
   * Implements the auth plugin interface.
   */
  async authenticate(username: string, authToken: string, cb: AuthCallback) {
    const userOrgs = await this.getGroupNames(username, authToken)

    if (userOrgs.includes(this.requiredGroup)) {
      cb(null, [this.requiredGroup])
    } else {
      log(`Unauthenticated: user "${username}" is not a member of "${this.requiredGroup}"`)
      cb(null, false)
    }
  }

  allow_access(user: RemoteUser, pkg: PackageAccess, cb: AuthCallback): void {
    const requiredAccess = [...pkg.access || []]

    if (requiredAccess.includes("$authenticated")) {
      requiredAccess.push(this.config.auth[pluginName].group)
    }

    const grantedAccess = intersection(user.groups, requiredAccess)

    if (grantedAccess.length === requiredAccess.length) {
      cb(null, user.groups)
    } else {
      log(`Access denied: user "${user.name}" is not a member of "${this.config.group}"`)
      cb(null, false)
    }
  }

  private async getGroupNames(username: string, authToken: string): Promise<string[]> {
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

    if (!cached().groupNames) {
      try {
        let groups = await this.gitlab.requestUserGroups(authToken)
        let groupNames = groups.map(group => group.path)

        this.cache[username] = {
          authToken,
          groupNames,
          expires: nearFuture(),
        }
      } catch (error) {
        log(error.message)
      }
    }

    return cached().groupNames || []
  }

}
