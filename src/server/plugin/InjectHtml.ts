import { NextFunction, Response, static as serveStatic } from "express"

const publicDir = "/-/static/github-oauth-ui"
const scriptTag = `<script src="${publicDir}/script.js"></script>`
const styleTag = `<link href="${publicDir}/styles.css" rel="stylesheet">`
const headWithStyle = [styleTag, "</head>"].join("")
const bodyWithScript = [scriptTag, "</body>"].join("")

export class InjectHtml {
  public static readonly path = "/-/static/github-oauth-ui"

  /**
   * Serves the injected style and script imports.
   */
  public serveMiddleware = serveStatic(__dirname + "/../../client")

  /**
   * Monkey-patches `res.send` in order to inject style and script imports.
   */
  public injectMiddleware = (req, res: Response, next: NextFunction) => {
    const originalSend = res.send
    res.send = (html, ...args) => {
      html = this.insertImportTags(html)
      return originalSend.call(res, html, ...args)
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
