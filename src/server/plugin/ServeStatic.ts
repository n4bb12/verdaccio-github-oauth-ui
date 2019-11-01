import { IPluginMiddleware } from "@verdaccio/types"
import { Application, static as expressServeStatic } from "express"

import { pluginName, publicRoot } from "./Config"

/**
 * Serves additional static assets required to modify the login button.
 */
export class ServeStatic implements IPluginMiddleware<any> {

  static readonly path = "/-/static/" + pluginName

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application) {
    app.use(ServeStatic.path, expressServeStatic(publicRoot))
  }

}
