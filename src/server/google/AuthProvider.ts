import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { stringify } from 'querystring';
import { AuthProvider } from '../plugin/AuthProvider';
import { ParsedPluginConfig } from '../plugin/Config';
import { GoogleClient } from './Client';

export class GoogleAuthProvider implements AuthProvider {
  private readonly client = new GoogleClient(this.tokenBaseUrl, this.userInfoBaseUrl);
  constructor(private readonly config: ParsedPluginConfig) {}
  get authBaseUrl(): string {
    return "https://accounts.google.com"
  }
  get tokenBaseUrl(): string {
    return "https://oauth2.googleapis.com"
  }
  get userInfoBaseUrl(): string {
    return "https://openidconnect.googleapis.com"
  }
  getId(): string {
    return 'google';
  }
  getLoginUrl(callbackUrl: string): string {
    const params = {
      client_id: this.config.clientId,
      redirect_uri: callbackUrl,
      scope: 'openid email profile',
      response_type: 'code',
      hd: this.config.domain ?? ''
    };
    const queryParams = stringify(params);
    return this.authBaseUrl + `/o/oauth2/v2/auth?` + queryParams;
  }
  getCode(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): string {
    return req.query.code as string;
  }
  async getToken(code: string,  redirectUrl: string): Promise<string> {
    const auth = await this.client.requestAccessToken(code, this.config.clientId, this.config.clientSecret, redirectUrl);
    return auth.access_token;
  }
  async getUserName(token: string): Promise<string> {
    const user = await this.client.requestUser(token);
    return user.email;
  }
  async getGroups(): Promise<string[]> {
    return ['google']
  }
}