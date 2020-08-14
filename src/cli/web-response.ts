import { Response } from "express"

import {
  accessDeniedPage,
  buildErrorPage,
  buildStatusPage,
} from "../statusPage"
import { getConfigFile } from "./npm"

const successPage = buildStatusPage(`
  <h1>All done!</h1>
  <p>We've updated your npm configuration.</p>
  <p><code>${getConfigFile()}</code></p>
`)

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
      res.send(accessDeniedPage)
      break

    default:
      res.status(500)
      res.send(buildErrorPage(message))
      break
  }
}
