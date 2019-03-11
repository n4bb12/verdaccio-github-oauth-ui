import { AuthMiddleware } from "./AuthMiddleware"
import { AuthWebUI } from "./AuthWebUI"
import { BasicAuth } from "./BasicAuth"

export interface Auth extends BasicAuth, AuthMiddleware, AuthWebUI {
  config: any
  logger: any
  secret: string
  plugins: any[]
}
