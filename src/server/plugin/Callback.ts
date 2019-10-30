import { Handler, NextFunction, Request, Response } from "express"
import { get } from "lodash"
import { stringify } from "querystring"

import { GitLabClient, GitLabOAuth, GitLabUser } from "../gitlab"
import { Auth, getSecurity, User } from "../verdaccio"
import { getConfig, getMajorVersion, PluginConfig } from "./Config"

export class Callback {

  static readonly path = "/-/oauth/callback"

  private readonly requiredGroup = getConfig(this.config, "group")
  private readonly clientId = getConfig(this.config, "client-id")
  private readonly clientSecret = getConfig(this.config, "client-secret")
  private readonly gitlabHost = getConfig(this.config, "gitlab-host")
  private readonly gitlab = new GitLabClient(this.gitlabHost)
  private readonly version = getMajorVersion(this.config)

  constructor(
    private readonly config: PluginConfig,
    private readonly auth: Auth,
  ) { }

  /**
   * After a successful OAuth authentication, gitLab redirects back to us.
   * We use the OAuth code to get an OAuth access token and the username associated
   * with the GitLab account.
   *
   * The token and username are encryped and base64 encoded and configured as npm
   * credentials for this registry. There is no need to later decode and decrypt the token.
   * This process is automatically reversed before the token is passed to the authenticate
   * middleware.
   *
   * We then issue a JWT token using these values and pass them back to the frontend
   * as query parameters so they can be stored in the browser.
   */
  middleware: Handler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code
      const callbackUrl = Callback.getCallbackUrl(req, this.config)

      const gitlabOauth = await this.gitlab.requestAccessToken(code, this.clientId, this.clientSecret, callbackUrl)
      const gitlabUser = await this.gitlab.requestUser(gitlabOauth.access_token)

      console.log(gitlabUser)

      if (gitlabUser.groups.includes(this.requiredGroup)) {
        await this.grantAccess(res, gitlabOauth, gitlabUser)
      } else {
        await this.denyAccess(res)
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * This is where itLab should redirect back to.
   */
  static getCallbackUrl(req: Request, config: PluginConfig): string {
    return Callback.getRegistryUrl(req, config) + Callback.path
  }

  /**
   * This is the same as what `npm config get registry` returns.
   */
  static getRegistryUrl(req: Request, config: PluginConfig): string {
    const prefix = get(config, "url_prefix", "")
    if (prefix) {
      return prefix.replace(/\/?$/, "") // Remove potential trailing slash
    }
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return protocal + "://" + req.get("host")
  }

  private async grantAccess(res: Response, gitlabOauth: GitLabOAuth, gitlabUser: GitLabUser) {
    const npmAuth = gitlabUser.nickname + ":" + gitlabOauth.access_token
    const encryptedNpmToken = this.encrypt(npmAuth)

    const user: User = {
      name: gitlabUser.nickname,
      groups: [this.requiredGroup],
      real_groups: [this.requiredGroup],
    }

    const encryptedJWT = this.version === 3
      ? await this.issueJWTVerdaccio3(user)
      : await this.issueJWTVerdaccio4(user)

    const frontendUrl = "/?" + stringify({
      username: gitlabUser.nickname,
      jwtToken: encryptedJWT,
      npmToken: encryptedNpmToken,
    })

    res.redirect(frontendUrl)
  }

  private denyAccess(res: Response) {
    res.send(`
      Access denied: you are not a member of "${this.requiredGroup}"<br>
      <a href="/">Go back</a>
    `)
  }

  // https://github.com/verdaccio/verdaccio/blob/3.x/src/api/web/endpoint/user.js#L15
  private async issueJWTVerdaccio3(user: User) {
    return this.auth.issueUIjwt(user, "24h")
  }

  // https://github.com/verdaccio/verdaccio/blob/master/src/api/web/endpoint/user.ts#L31
  private async issueJWTVerdaccio4(user: User) {
    const jWTSignOptions = getSecurity(this.config).web.sign
    return this.auth.jwtEncrypt(user, jWTSignOptions)
  }

  private encrypt(text: string) {
    return this.auth.aesEncrypt(new Buffer(text)).toString("base64")
  }

}
