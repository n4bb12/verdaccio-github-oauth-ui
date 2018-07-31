import { Request, Response } from 'express'
import { get } from 'lodash'
import * as querystring from 'querystring'

import { OAuthCallback } from './OAuthCallback'

export class OAuthAuthorize {

  public static readonly path = '/-/oauth/authorize'

  constructor(
    private readonly config: any,
  ) { }

  /**
   * This middleware is called when the user clicks the login button.
   * To login we redirect to GitHub with a custom callback URL so that we can handle
   * the response.
   */
  public middleware = (req: Request, res: Response, next) => {
    const url = 'https://github.com/login/oauth/authorize?' + querystring.stringify({
      client_id: this.config['client-id'],
      redirect_uri: this.getRedirectUrl(req),
      scope: 'read:org',
    })
    res.redirect(url)
  }

  /**
   * This is where GitHub should redirect back to.
   */
  public getRedirectUrl(req: Request): string {
    return this.getRegistryUrl(req) + OAuthCallback.path
  }

  /**
   * This is the same as what `npm config get registry` returns.
   */
  public getRegistryUrl(req: Request): string {
    const prefix = get(this.config, 'url_prefix', '')
      .replace(/\/?$/, '') // Remove trailing slash if needed
    return (req.protocol + '://' + req.get('host') + prefix)
  }

}
