import { IPluginMiddleware } from "@verdaccio/types"
import { getPublicUrl } from "@verdaccio/url"
import { Application, Handler, Request } from "express"
import { staticPath } from "../constants"
import { ParsedPluginConfig } from "./Config"

/**
 * Injects additional static imports into the DOM with code from the client folder
 * that modifies the login button.
 */
export class PatchHtml implements IPluginMiddleware<any> {
  constructor(private readonly config: ParsedPluginConfig) {}

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

    res.send = (html) => {
      html = this.insertTags(req, html)
      return send.call(res, html)
    }

    next()
  }

  private insertTags = (req: Request, html: string | Buffer): string => {
    html = String(html)

    if (!html.includes("__VERDACCIO_BASENAME_UI_OPTIONS")) {
      return html
    }

    const urlPrefix = this.config.url_prefix
    const baseUrl = getPublicUrl(urlPrefix, req as any).replace(/\/$/, "")
    const basePath = `${baseUrl}${staticPath}`
    const scriptUrl = `${basePath}/verdaccio-5.js`
    const scriptTag = `<script defer="defer" src="${scriptUrl}"></script>`

    return html.replace(/<\/body>/, [scriptTag, "</body>"].join(""))
  }
}
