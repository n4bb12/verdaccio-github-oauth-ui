import { Application } from "express"

import { Auth } from "./Auth"
import { Storage } from "./Storage"

/**
 * https://verdaccio.org/docs/en/dev-plugins#middleware-plugin
 */
export interface MiddlewarePlugin {
  register_middlewares(app: Application, auth: Auth, storage: Storage): void
}
