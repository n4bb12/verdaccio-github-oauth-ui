import express from "express"
import open from "open"

import { cliPort, cliProviderId } from "../constants"
import { saveNpmToken } from "../npm"
import { getAuthorizePath } from "../redirect"
import { respondWithCliMessage } from "./cli-response"
import { validateRegistry } from "./usage"
import { respondWithWebPage } from "./web-response"

const registry = validateRegistry()
const authorizeUrl = registry + getAuthorizePath(cliProviderId)

const server = express()
  .get("/", (req, res) => {
    let status = req.query.status as string
    let message = req.query.message as string
    const token = decodeURIComponent(req.query.token as string)

    try {
      if (status === "success") {
        saveNpmToken(token)
      }
    } catch (error) {
      status = "error"
      message = error.message
    }

    respondWithWebPage(status, message, res)
    respondWithCliMessage(status, message)

    server.close()
    process.exit(status === "success" ? 0 : 1)
  })
  .listen(cliPort, () => {
    open(authorizeUrl)
  })
