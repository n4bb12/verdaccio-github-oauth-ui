import { WebUIUser } from "./WebUIUser"

export interface AuthWebUI {
  issueUIjwt(user: WebUIUser, time?: string): string
}
