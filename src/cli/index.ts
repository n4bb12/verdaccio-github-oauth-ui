import express from "express"
import open from "open"

import { buildStatusPage } from "../statusPage"
import { getConfigFile, getRegistry, save } from "./npm"
import { printUsage } from "./usage"

const registry = getRegistry()

if (registry.includes("registry.npmjs.org")) { // lgtm [js/incomplete-url-substring-sanitization]
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
  .get("/", (req, res) => {
    const token = decodeURIComponent(req.query.token)
    save(registry, token)
    res.setHeader("Content-Type", "text/html")
    res.send(successPage)
    server.close()
    process.exit(0)
  })
  .listen(8239)
