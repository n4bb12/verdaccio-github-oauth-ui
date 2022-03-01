import { IPluginMiddleware } from "@verdaccio/types"
import { Application, Handler } from "express"
import { staticPath } from "../../constants"

/**
 * Injects additional static imports into the DOM with code from the client folder
 * that modifies the login button.
 */
export class PatchHtml implements IPluginMiddleware<any> {
  private readonly scriptTag = `<script src="${staticPath}/verdaccio-5.js"></script>`

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
      html = this.insertTags(html)
      return send.call(res, html)
    }
    next()
  }

  private insertTags = (html: string | Buffer): string => {
    html = String(html)
    if (!html.includes("__VERDACCIO_BASENAME_UI_OPTIONS")) {
      return html
    }
    return html.replace(/<\/body>/, [this.scriptTag, "</body>"].join(""))
  }
}
