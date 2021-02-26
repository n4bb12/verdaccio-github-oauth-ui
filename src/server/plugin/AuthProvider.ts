import { Request } from "express"
import { Config } from "../plugin/Config"

export interface AuthProvider {
  getId(): string
  getLoginUrl(callbackUrl: string): string
  getCode(req: Request): string

  getToken(code: string): Promise<string>
  getUsername(token: string): Promise<string>
  getGroups(token: string): Promise<string[]>
  getTeams(username: string, group: string, token: string): Promise<string[]>

  getConf(): Config
}
