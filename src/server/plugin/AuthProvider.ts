export interface AuthProvider {
  getToken(code: string): Promise<string>
  getUsername(token: string): Promise<string>
  getGroups(token: string): Promise<string[]>
}
