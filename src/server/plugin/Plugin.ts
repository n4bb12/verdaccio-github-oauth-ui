import { AllowAccess, PackageAccess, RemoteUser } from "@verdaccio/types"
import { pluginUtils, errorUtils } from "@verdaccio/core"
import { Application } from "express"
import { logger } from "../../logger"
import { CliFlow, WebFlow } from "../flows"
import { GitHubAuthProvider } from "../github"
import { Cache } from "./Cache"
import { VerdaccioGithubOauthConfig, ParsedPluginConfig } from "./Config"
import { PatchHtml } from "./PatchHtml"
import { ServeStatic } from "./ServeStatic"
import { Verdaccio } from "./Verdaccio"
import { createAuthenticatedUser } from "../helpers"

type Package = PackageAccess & (AllowAccess | VerdaccioGithubOauthConfig)
type Action = "access" | "publish" | "unpublish"

function logAccess(
  user: RemoteUser,
  pkg: Package,
  action: Action,
  grant: boolean,
) {
  logger.debug({
    package: pkg.name,
    action: action,
    user: user.name,
    grant: grant,
  })
}

/**
 * Implements the verdaccio plugin interfaces.
 */
export class Plugin
  extends pluginUtils.Plugin<VerdaccioGithubOauthConfig>
  implements
    pluginUtils.ExpressMiddleware<VerdaccioGithubOauthConfig, any, any>,
    pluginUtils.Auth<VerdaccioGithubOauthConfig>
{
  private readonly parsedConfig: ParsedPluginConfig
  private readonly provider: GitHubAuthProvider
  private readonly cache: Cache
  private readonly verdaccio: Verdaccio

  constructor(
    readonly config: VerdaccioGithubOauthConfig,
    options?: any,
  ) {
    super(config, options)

    this.parsedConfig = new ParsedPluginConfig(this.config)
    this.provider = new GitHubAuthProvider(this.parsedConfig)
    this.cache = new Cache(this.provider, this.parsedConfig.cacheTTLms)
    this.verdaccio = new Verdaccio(this.config)
  }

  /**
   * pluginUtils.ExpressMiddleware
   */
  register_middlewares(app: Application, auth: any) {
    this.verdaccio.setAuth(auth)

    const children = [
      new ServeStatic(),
      new PatchHtml(this.parsedConfig),
      new WebFlow(this.verdaccio, this.parsedConfig, this.provider),
      new CliFlow(this.verdaccio, this.provider),
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

      const user = createAuthenticatedUser(userName)

      callback(null, user.real_groups)
    } catch (error) {
      callback(error, false)
    }
  }

  private async _allow(
    user: RemoteUser,
    pkg: Package,
    action: Action,
    callback: pluginUtils.AccessCallback,
  ) {
    if (!user.name) {
      // let other auth plugins and verdaccio's default handler deal with unauthenticated users
      logAccess(user, pkg, action, false)
      callback(null, false)
      return
    }

    const requiredGroups = pkg[action] as string[] | undefined
    const userGroups = await this.cache.getGroups(user.name)
    const grant = !!requiredGroups?.some((group) => userGroups.includes(group))

    logAccess(user, pkg, action, grant)
    callback(null, grant)
  }

  /**
   * pluginUtils.Auth
   */
  async allow_access(
    user: RemoteUser,
    pkg: Package,
    callback: pluginUtils.AccessCallback,
  ): Promise<void> {
    await this._allow(user, pkg, "access", callback)
  }

  /**
   * IPluginAuth
   */
  async allow_publish(
    user: RemoteUser,
    pkg: Package,
    callback: pluginUtils.AccessCallback,
  ): Promise<void> {
    await this._allow(user, pkg, "publish", callback)
  }

  /**
   * IPluginAuth
   */
  async allow_unpublish(
    user: RemoteUser,
    pkg: Package,
    callback: pluginUtils.AccessCallback,
  ): Promise<void> {
    if (pkg.unpublish === false) {
      // let verdaccio's default behavior call allow_publish() for authentication
      logAccess(user, pkg, "unpublish", false)
      callback(null, undefined)
      return
    }

    if (pkg.unpublish === true) {
      // `true` is not a valid value - this should never happen - Verdaccio shouldn't even allow us to end up here
      // this here mostly to satisfy TypeScript and avoid an `as string[]` cast below
      logAccess(user, pkg, "unpublish", false)
      callback(
        errorUtils.getInternalError("Invalid package unpublish configuration"),
        false,
      )
      return
    }

    await this._allow(user, pkg, "unpublish", callback)
  }
}
