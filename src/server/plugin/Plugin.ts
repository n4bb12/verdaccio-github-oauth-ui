import { AllowAccess, PackageAccess, RemoteUser } from "@verdaccio/types"
import { pluginUtils, errorUtils } from "@verdaccio/core"
import { Application } from "express"
import { logger } from "../../logger"
import { CliFlow, WebFlow } from "../flows"
import { GitHubAuthProvider } from "../github"
import { AuthCore } from "./AuthCore"
import { Cache } from "./Cache"
import { VerdaccioGithubOauthConfig, ParsedPluginConfig } from "./Config"
import { PatchHtml } from "./PatchHtml"
import { registerGlobalProxyAgent } from "./ProxyAgent"
import { ServeStatic } from "./ServeStatic"
import { Verdaccio } from "./Verdaccio"

/**
 * Implements the verdaccio plugin interfaces.
 */
export class Plugin
  extends pluginUtils.Plugin<VerdaccioGithubOauthConfig>
  implements
    pluginUtils.ExpressMiddleware<VerdaccioGithubOauthConfig, any, any>,
    pluginUtils.Auth<VerdaccioGithubOauthConfig>
{
  private readonly parsedConfig = new ParsedPluginConfig(this.config)
  private readonly provider = new GitHubAuthProvider(this.parsedConfig)
  private readonly cache = new Cache(
    this.provider,
    this.parsedConfig.cacheTTLms,
  )
  private readonly verdaccio = new Verdaccio(this.config)
  private readonly core = new AuthCore()

  constructor(
    readonly config: VerdaccioGithubOauthConfig,
    options?: any,
  ) {
    super(config, options)
    registerGlobalProxyAgent()
  }

  /**
   * pluginUtils.ExpressMiddleware
   */
  register_middlewares(app: Application, auth: any) {
    this.verdaccio.setAuth(auth)

    const children = [
      new ServeStatic(),
      new PatchHtml(this.parsedConfig),
      new WebFlow(this.verdaccio, this.parsedConfig, this.core, this.provider),
      new CliFlow(this.verdaccio, this.core, this.provider),
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
   * pluginUtils.Auth
   */
  async authenticate(
    userName: string,
    userToken: string,
    callback: pluginUtils.AuthCallback,
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

      const user = await this.core.createAuthenticatedUser(userName)

      callback(null, user.real_groups)
    } catch (error) {
      callback(error, false)
    }
  }

  /**
   * pluginUtils.Auth
   */
  async allow_access(
    user: RemoteUser,
    pkg:
      | (VerdaccioGithubOauthConfig & PackageAccess)
      | (AllowAccess & PackageAccess),
    callback: pluginUtils.AccessCallback,
  ): Promise<void> {
    if (!user.name) {
      // let other auth plugins and verdaccio's default handler deal with unauthenticated users
      callback(null, false)
      return
    }

    const userGroups = await this.cache.getGroups(user.name)

    // pkg.access cannot be undefined here due to normalisePackageAccess() in @verdaccio/config
    const grant = pkg.access!.some((group) => userGroups.includes(group))
    callback(null, grant)
  }

  /**
   * IPluginAuth
   */
  async allow_publish(
    user: RemoteUser,
    pkg:
      | (VerdaccioGithubOauthConfig & PackageAccess)
      | (AllowAccess & PackageAccess),
    callback: pluginUtils.AccessCallback,
  ): Promise<void> {
    if (!user.name) {
      // let other auth plugins and verdaccio's default handler deal with unauthenticated users
      callback(null, false)
      return
    }

    const userGroups = await this.cache.getGroups(user.name)

    // pkg.publish cannot be undefined here due to normalisePackageAccess() in @verdaccio/config
    const grant = pkg.publish!.some((group) => userGroups.includes(group))
    callback(null, grant)
  }

  /**
   * IPluginAuth
   */
  async allow_unpublish(
    user: RemoteUser,
    pkg:
      | (VerdaccioGithubOauthConfig & PackageAccess)
      | (AllowAccess & PackageAccess),
    callback: pluginUtils.AccessCallback,
  ): Promise<void> {
    if (!user.name) {
      // let other auth plugins and verdaccio's default handler deal with unauthenticated users
      callback(null, false)
      return
    }

    if (pkg.unpublish === false) {
      // let verdaccio's default behavior call allow_publish() for authentication
      callback(null, undefined)
      return
    }

    if (pkg.unpublish === true) {
      // `true` is not a valid value - this should never happen - Verdaccio shouldn't even allow us to end up here
      // this here mostly to satisfy TypeScript and avoid an `as string[]` cast below
      callback(
        errorUtils.getInternalError("Invalid package unpublish configuration"),
        false,
      )
      return
    }

    const userGroups = await this.cache.getGroups(user.name)

    // pkg.unpublish cannot be undefined here due to normalisePackageAccess() in @verdaccio/config
    const grant = pkg.unpublish!.some((group) => userGroups.includes(group))
    callback(null, grant)
  }
}
