import { Auth } from "./Auth"

/**
 * https://verdaccio.org/docs/en/dev-plugins#middleware-plugin
 */
export interface MiddlewarePlugin {
  register_middlewares(app: any, auth: Auth, storage: any): void
}
