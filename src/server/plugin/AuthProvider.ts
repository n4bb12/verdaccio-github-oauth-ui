import { Request } from "express"

export interface AuthProvider {
  getLoginUrl(redirectUrl: string): Promise<string>
  getCode(req: Request): Promise<string>
  getToken(code: string): Promise<string>
  getUsername(token: string): Promise<string>
  getGroups(token: string): Promise<string[]>
}
