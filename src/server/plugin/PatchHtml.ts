import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler, NextFunction, Request, Response } from "express"
import { readFileSync } from "fs"

import { Config, getMajorVersion, publicRoot } from "./Config"
import { ServeStatic } from "./ServeStatic"

/**
 * Injects additional tags into the DOM that modify the login button.
 */
export class PatchHtml implements IPluginMiddleware<any> {

  private readonly majorVersion = getMajorVersion(this.config)
  private readonly scriptTag = `<script src="${ServeStatic.path}/verdaccio-${this.majorVersion}.js"></script>`
  private readonly styleTag = `<style>${readFileSync(`${publicRoot}/verdaccio-${this.majorVersion}.css`)}</style>`
  private readonly headWithStyle = [this.styleTag, "</head>"].join("")
  private readonly bodyWithScript = [this.scriptTag, "</body>"].join("")

  constructor(
    private readonly config: Config,
  ) { }

  /**
   * Implements the middleware plugin interface.
   */
  register_middlewares(app: Application) {
    app.use(this.patchResponse)
  }

  /**
   * Monkey-patches `res.send` in order to inject style and script imports.
   */
  patchResponse: Handler = (req: Request, res: Response, next: NextFunction) => {
    const send = res.send
    res.send = html => {
      html = this.insertAssetTags(html)
      return send.call(res, html)
    }
    next()
  }

  private insertAssetTags = (html: string | Buffer): string => {
    html = String(html)
    if (!html.includes("VERDACCIO_API_URL")) {
      return html
    }
    return html
      .replace(/<\/head>/, this.headWithStyle)
      .replace(/<\/body>/, this.bodyWithScript)
  }

}
