import { Response } from "express"
import { getNpmConfigFile } from "../npm"

import {
  buildAccessDeniedPage,
  buildErrorPage,
  buildStatusPage,
} from "../statusPage"

const withBackButton = false

const successPage = buildStatusPage(
  `<h1>All done!</h1>
  <p>We've updated your npm configuration.</p>
  <p><code>${getNpmConfigFile()}</code></p>`,
  withBackButton,
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

    case "denied":
      res.status(401)
      res.send(buildAccessDeniedPage(withBackButton))
      break

    default:
      res.status(500)
      res.send(buildErrorPage(message, withBackButton))
      break
  }
}
