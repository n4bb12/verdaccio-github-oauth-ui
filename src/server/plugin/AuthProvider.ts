import { Request } from "express"

export interface AuthProvider {
  getId(): string
  getLoginUrl(callbackUrl: string): string
  getCode(req: Request): string

  getToken(code: string): Promise<string>
  getUserName(token: string): Promise<string>
  getGroups(userName: string): Promise<string[]>
}
