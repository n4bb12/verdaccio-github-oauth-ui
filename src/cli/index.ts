import express from "express"
import open from "open"

import { registry, saveToken } from "./npm"
import { successPage } from "./success"
import { printUsage } from "./usage"

if (registry.includes("registry.npmjs.org")) {
  printUsage()
  process.exit(1)
}

open(registry + "/oauth/authorize")

const server = express()
  .get("/", (req, res) => {
    const token = decodeURIComponent(req.query.token)
    saveToken(token)
    res.setHeader("Content-Type", "text/html")
    res.send(successPage)
    server.close()
  })
  .listen(8239)
