import {
  Handler,
  NextFunction,
  Request,
  Response,
  static as expressServeStatic,
} from "express"

const publicDir = "/-/static/github-oauth-ui"
const scriptTag = `<script src="${publicDir}/login-button.js"></script>`
const styleTag = `<link href="${publicDir}/styles.css" rel="stylesheet">`
const headWithStyle = [styleTag, "</head>"].join("")
const bodyWithScript = [scriptTag, "</body>"].join("")

/**
 * Injects additional tags into the DOM that modify the login button.
 */
export class InjectHtml {
  static readonly path = "/-/static/github-oauth-ui"

  /**
   * Serves the injected style and script imports.
   */
  serveAssetsMiddleware: Handler = expressServeStatic(__dirname + "/../../client")

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
      .replace(/<\/head>/, headWithStyle)
      .replace(/<\/body>/, bodyWithScript)
  }

}
