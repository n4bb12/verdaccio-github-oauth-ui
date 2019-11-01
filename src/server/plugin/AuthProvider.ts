import { Request } from "express"

export interface AuthProvider {
  getId(): string
  getLoginUrl(redirectUrl: string): string
  getCode(req: Request): string
  getToken(code: string): Promise<string>
  getUsername(token: string): Promise<string>
  getGroups(token: string): Promise<string[]>
}
