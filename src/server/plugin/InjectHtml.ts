import {
  Handler,
  NextFunction,
  Request,
  Response,
  static as expressServeStatic,
} from "express"

import { pluginName } from "./Config"

/**
 * Injects additional tags into the DOM that modify the login button.
 */
export class InjectHtml {

  static readonly path = "/-/static/" + pluginName
  static readonly fsRoot = __dirname + "/public"

  /**
   * Serves the injected style and script imports.
   */
  readonly serveAssetsMiddleware = expressServeStatic(InjectHtml.fsRoot)


  private readonly scriptTag = `<script src="${InjectHtml.path}/login-button.js"></script>`
  private readonly styleTag = `<link href="${InjectHtml.path}/styles.css" rel="stylesheet">`
  private readonly headWithStyle = [this.styleTag, "</head>"].join("")
  private readonly bodyWithScript = [this.scriptTag, "</body>"].join("")

  /**
   * Monkey-patches `res.send` in order to inject style and script imports.
   */
  injectAssetsMiddleware: Handler = (req: Request, res: Response, next: NextFunction) => {
    const send = res.send
    res.send = html => {
      html = this.insertImportTags(html)
      return send.call(res, html)
    }
    next()
  }

  private insertImportTags = (html: string | Buffer): string => {
    html = String(html)
    if (!html.includes("VERDACCIO_API_URL")) {
      return html
    }
    return html
      .replace(/<\/head>/, this.headWithStyle)
      .replace(/<\/body>/, this.bodyWithScript)
  }

}
