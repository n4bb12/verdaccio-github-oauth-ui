import {
  Handler,
  NextFunction,
  Request,
  Response,
  static as expressServeStatic,
} from "express"
import { readFileSync } from "fs"

import { getMajorVersion, PluginConfig, pluginName } from "./Config"

const publicRoot = __dirname + "/public"

/**
 * Injects additional tags into the DOM that modify the login button.
 */
export class InjectHtml {

  static readonly path = "/-/static/" + pluginName

  /**
   * Serves the injected style and script imports.
   */
  readonly serveAssetsMiddleware = expressServeStatic(publicRoot)

  private readonly version = getMajorVersion(this.config)
  private readonly scriptTag = `<script src="${InjectHtml.path}/verdaccio-${this.version}.js"></script>`
  private readonly styleTag = `<style>${readFileSync(`${publicRoot}/verdaccio-${this.version}.css`)}</style>`
  private readonly headWithStyle = [this.styleTag, "</head>"].join("")
  private readonly bodyWithScript = [this.scriptTag, "</body>"].join("")

  constructor(
    private readonly config: PluginConfig,
  ) { }

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
