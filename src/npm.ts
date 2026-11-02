import { execSync } from "child_process"
import { parseArgs } from "node:util"

import Config from "@npmcli/config"
import {
  definitions,
  flatten,
  shorthands,
} from "@npmcli/config/lib/definitions"

import { logger } from "./logger"

let npmConfig: { registry?: string; userconfig?: string } | undefined

function parseCliArgs() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    strict: false,
    options: {
      registry: { type: "string" },
    },
  })

  return values
}

function runCommand(command: string) {
  logger.log(`Running command: ${command}`)

  return execSync(command).toString()
}

function getNpmConfig() {
  if (!npmConfig) {
    const npmConfigJson = runCommand("npm config list --json")

    npmConfig = JSON.parse(npmConfigJson)
  }

  return npmConfig ?? {}
}

function removeTrailingSlash(input: string) {
  return input.trim().replace(/\/?$/, "")
}

export function getRegistryUrl() {
  const cliArgs = parseCliArgs()

  const registry =
    typeof cliArgs.registry === "string"
      ? cliArgs.registry
      : getNpmConfig().registry

  if (typeof registry !== "string") {
    throw new Error("No npm registry configured")
  }

  return removeTrailingSlash(registry)
}

export function getNpmConfigFile() {
  return getNpmConfig().userconfig
}

async function loadNpmCliConfig() {
  const config = new Config({
    argv: ["node", "npm"],
    definitions,
    flatten,
    npmPath: process.cwd(),
    shorthands,
  })

  await config.load()

  return config
}

export async function saveNpmToken(token: string) {
  const registry = getRegistryUrl()
  const config = await loadNpmCliConfig()
  const url = new URL(registry)
  const key = `//${url.host}${url.pathname}:_authToken`

  config.set(key, token, "user")

  await config.save("user")
}
