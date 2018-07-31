export interface AuthWebUI {
  issueUIjwt(user: string, time?: string): string
}
