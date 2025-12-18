import { Application, static as expressServeStatic } from "express"
import { staticPath, publicRoot } from "../constants"
import { IPluginMiddleware } from "../helpers"

/**
 * Serves additional static assets required to modify the login button.
 */
export class ServeStatic implements IPluginMiddleware {
  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.use(staticPath, expressServeStatic(publicRoot))
  }
}
