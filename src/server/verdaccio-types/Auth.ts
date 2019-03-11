import { IBasicAuth } from "@verdaccio/types"

import { AuthMiddleware } from "./AuthMiddleware"
import { AuthWebUI } from "./AuthWebUI"

export interface Auth extends IBasicAuth<any>, AuthMiddleware, AuthWebUI {
  config: any
  logger: any
  secret: string
  plugins: any[]
}
