import { execSync } from "child_process"
import minimist from "minimist"
import { URL } from "url"

import { logger } from "./logger"

let npmConfig: any

function parseCliArgs() {
  return minimist(process.argv.slice(2))
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
  return npmConfig
}

function removeTrailingSlash(input: string) {
  return input.trim().replace(/\/?$/, "")
}

export function getRegistryUrl() {
  const cliArgs = parseCliArgs()

  const registry = cliArgs.registry || getNpmConfig().registry

  return removeTrailingSlash(registry)
}

export function getNpmConfigFile() {
  return getNpmConfig().userconfig
}

export function getNpmSaveCommand(registry: string, token: string) {
  const url = new URL(registry)
  const baseUrl = url.host + url.pathname

  return `npm config set //${baseUrl}:_authToken "${token}"`
}

export function saveNpmToken(token: string) {
  const registry = getRegistryUrl()
  const command = getNpmSaveCommand(registry, token)

  runCommand(command)
}
