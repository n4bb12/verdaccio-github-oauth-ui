import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler } from "express"
import { readFileSync } from "fs"

import { Verdaccio } from "../verdaccio"
import { publicRoot, staticPath } from "./Config"

/**
 * Injects additional static imports into the DOM with code from the client folder
 * that modifies the login button.
 */
export class PatchHtml implements IPluginMiddleware<any> {

  private readonly scriptTag = `<script src="${staticPath}/verdaccio-${this.verdaccio.majorVersion}.js"></script>`
  private readonly styleTag = `<style>${readFileSync(`${publicRoot}/verdaccio-${this.verdaccio.majorVersion}.css`)}</style>`
  private readonly headWithStyle = [this.styleTag, "</head>"].join("")
  private readonly bodyWithScript = [this.scriptTag, "</body>"].join("")

  constructor(
    private readonly verdaccio: Verdaccio,
  ) { }

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application) {
    app.use(this.patchResponse)
  }

  /**
   * Patches `res.send` in order to inject style and script tags.
   */
  patchResponse: Handler = (req, res, next) => {
    const send = res.send
    res.send = html => {
      html = this.insertTags(html)
      return send.call(res, html)
    }
    next()
  }

  private insertTags = (html: string | Buffer): string => {
    html = String(html)
    if (!html.includes("VERDACCIO_API_URL")) {
      return html
    }
    return html
      .replace(/<\/head>/, this.headWithStyle)
      .replace(/<\/body>/, this.bodyWithScript)
  }

}
