import { IPluginMiddleware } from "@verdaccio/types"
import { Application, static as expressServeStatic } from "express"
import { staticPath, publicRoot } from "../constants"

/**
 * Serves additional static assets required to modify the login button.
 */
export class ServeStatic implements IPluginMiddleware<any> {
  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.use(staticPath, expressServeStatic(publicRoot))
  }
}
