import {
  AllowAccess,
  AuthAccessCallback,
  AuthCallback,
  IPluginAuth,
  IPluginMiddleware,
  PluginOptions,
  RemoteUser,
  Callback
} from "@verdaccio/types"
import { Application } from "express"
import { logger } from "../../logger"
import { CliFlow, WebFlow } from "../flows"
import { GoogleAuthProvider } from "../google"
import { AuthCore } from "./AuthCore"
import { Cache } from "./Cache"
import { Config, PackageAccess, ParsedPluginConfig } from "./Config"
import { PatchHtml } from "./PatchHtml"
import { registerGlobalProxyAgent } from "./ProxyAgent"
import { ServeStatic } from "./ServeStatic"
import { Auth, Verdaccio } from "./Verdaccio"

/**
 * Implements the verdaccio plugin interfaces.
 */
export class Plugin implements IPluginAuth<any> {
  private readonly parsedConfig = new ParsedPluginConfig(this.config)
  private readonly provider = new GoogleAuthProvider(this.parsedConfig)
  private readonly cache = new Cache(this.provider)
  private readonly verdaccio = new Verdaccio(this.config)
  private readonly core = new AuthCore(this.verdaccio, this.parsedConfig)

  constructor(private readonly config: Config, options: PluginOptions<Config>) {
    // registerGlobalProxyAgent()
  }

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application, auth: Auth) {
    this.verdaccio.setAuth(auth)

    const children = [
      new ServeStatic(),
      new PatchHtml(),
      new WebFlow(this.parsedConfig, this.core, this.provider),
      new CliFlow(this.parsedConfig, this.verdaccio, this.core, this.provider),
    ]

    for (const child of children) {
      child.register_middlewares(app)
    }
  }

  private async userNameAndTokenMatch(
    userName: string,
    userToken: string,
  ): Promise<boolean> {
    try {
      const userNameForToken = await this.provider.getUserName(userToken)
      if (userNameForToken !== userName) {
        logger.error("The token does not match the user name")
        return false
      }
      return true
    } catch (error) {
      logger.error(error)
      return false
    }
  }

  /**
   * IPluginAuth
   */
  async authenticate(
    userName: string,
    userToken: string,
    callback: AuthCallback,
  ): Promise<void> {
    try {
      if (
        !userName ||
        !userToken ||
        !(await this.userNameAndTokenMatch(userName, userToken))
      ) {
        callback(null, false)
        return
      }

      const userGroups = await this.cache.getGroups(userToken, userName)
      const user = await this.core.createAuthenticatedUser(userName, userGroups)

      callback(null, user.groups)
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
      console.log(config.access)
      const grant = config.access.some((group) => user.groups.includes(group))
      callback(null, grant)
    } else {
      callback(null, true)
    }
  }
}
