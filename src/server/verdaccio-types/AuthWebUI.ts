import { User } from "./User"

export interface AuthWebUI {
  issueUIjwt(user: User, time?: string): string
}
