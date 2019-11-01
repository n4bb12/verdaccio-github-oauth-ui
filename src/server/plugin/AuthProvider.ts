export interface AuthProvider {
  getLoginUrl(redirectUrl: string): Promise<string>
  getToken(code: string): Promise<string>
  getUsername(token: string): Promise<string>
  getGroups(token: string): Promise<string[]>
}
