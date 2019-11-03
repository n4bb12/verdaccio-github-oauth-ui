import express from "express"
import open from "open"

import { buildStatusPage } from "../statusPage"
import { npmConfig, registry, saveToken } from "./npm"
import { printUsage } from "./usage"

if (registry.includes("registry.npmjs.org")) { // lgtm [js/incomplete-url-substring-sanitization]
  printUsage()
  process.exit(1)
}

open(registry + "/oauth/authorize")

const successPage = buildStatusPage(`
  <h1>All done!</h1>
  <p>We've updated your npm configuration.</p>
  <p><code>${npmConfig.userconfig}</code></p>
`)

const server = express()
  .get("/", (req, res) => {
    const token = decodeURIComponent(req.query.token)
    saveToken(token)
    res.setHeader("Content-Type", "text/html")
    res.send(successPage)
    server.close()
  })
  .listen(8239)
