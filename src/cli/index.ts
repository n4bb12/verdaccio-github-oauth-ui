import dotenv from "dotenv"
import express from "express"
import open from "open"

import {
  cliDeniedCallbackPath,
  cliErrorCallbackPath,
  cliPort,
  cliSuccessCallbackPath,
} from "../constants"
import {
  accessDeniedPage,
  buildErrorPage,
  buildStatusPage,
} from "../statusPage"
import { getConfigFile, getRegistry, save } from "./npm"
import { printUsage } from "./usage"

dotenv.config()

const registry = getRegistry()

if (registry.includes("registry.npmjs.org")) {
  // lgtm [js/incomplete-url-substring-sanitization]
  printUsage()
  process.exit(1)
}

open(registry + "/oauth/authorize")

const successPage = buildStatusPage(`
  <h1>All done!</h1>
  <p>We've updated your npm configuration.</p>
  <p><code>${getConfigFile()}</code></p>
`)

const server = express()
  .get(cliSuccessCallbackPath, (req, res) => {
    const token = decodeURIComponent(req.query.token as string)
    save(registry, token)
    res.setHeader("Content-Type", "text/html")
    res.send(successPage)
    server.close()
    process.exit(0)
  })
  .get(cliDeniedCallbackPath, (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.status(401)
    res.send(accessDeniedPage)
    server.close()
    process.exit(1)
  })
  .get(cliErrorCallbackPath, (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.status(500)
    res.send(buildErrorPage(req.query.message))
    server.close()
    process.exit(1)
  })
  .listen(cliPort)
