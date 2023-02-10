import { Request } from "express"
import { ParamsDictionary } from "express-serve-static-core"
import { ParsedQs } from "qs"
import { AuthProvider } from "../plugin/AuthProvider"
import { ParsedPluginConfig } from "../plugin/Config"
import { GoogleClient } from "./Client"

export class GoogleAuthProvider implements AuthProvider {
  private readonly id = "google"

  private readonly client: GoogleClient
  constructor(private readonly config: ParsedPluginConfig) {
    this.client = new GoogleClient(config)
  }

  getId(): string {
    return this.id
  }

  getLoginUrl(callbackUrl: string): string {
    return this.client.getLoginUrl(callbackUrl)
  }
  getCode(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  ): string {
    return req.query.code as string
  }
  async getToken(code: string, redirectUrl: string): Promise<string> {
    const auth = await this.client.requestAccessToken(code, redirectUrl)
    return auth.tokens.access_token ?? ""
  }

  async getUserName(token: string): Promise<string> {
    const user = await this.client.requestUser(token)
    return user.email ?? ""
  }

  async getGroups(token: string, userName: string): Promise<string[]> {
    const groupsResponse = await this.client.requestGroups(token, userName)

    const groups =
      groupsResponse.data.groups?.flatMap((g) => (!!g.name ? [g.name] : [])) ??
      []

    return groups
  }
}
