import { Response } from "express"
import { getNpmConfigFile } from "../npm"

import { buildErrorPage, buildStatusPage } from "../statusPage"

const withBackLink = false

const successPage = buildStatusPage(
  `<h1>All done!</h1>
  <p>We've updated your npm configuration.</p>
  <p><code>${getNpmConfigFile()}</code></p>`,
  withBackLink,
)

export function respondWithWebPage(
  status: string,
  message: string,
  res: Response,
) {
  res.setHeader("Content-Type", "text/html")

  switch (status) {
    case "success":
      res.status(200)
      res.send(successPage)
      break

    default:
      res.status(500)
      res.send(buildErrorPage(message, withBackLink))
      break
  }
}
