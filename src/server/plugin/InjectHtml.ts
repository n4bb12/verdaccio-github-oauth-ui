import {
  Handler,
  NextFunction,
  Request,
  Response,
  static as expressServeStatic,
} from "express"

const publicDir = "/-/static/github-oauth-ui"
const scriptTag = `<script src="${publicDir}/login-button.js"></script>`
const styleTag = `<link href="${publicDir}/login-button.css" rel="stylesheet">`
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
  serveMiddleware: Handler = expressServeStatic(__dirname + "/../../client")

  /**
   * Monkey-patches `res.send` in order to inject style and script imports.
   */
  injectMiddleware: Handler = (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send
    res.send = (html: string, ...args: any[]) => {
      html = this.insertImportTags(html)
      return originalSend.call(res, [html, ...args])
    }
    next()
  }

  private insertImportTags = (html: string): string => {
    if (typeof html !== "string" || !html.includes("VERDACCIO_API_URL")) {
      return html
    }
    return html
      .replace(/<\/head>/, headWithStyle)
      .replace(/<\/body>/, bodyWithScript)
  }

}
