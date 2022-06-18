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
  return execSync(command)
}

function getNpmConfig() {
  if (!npmConfig) {
    npmConfig = JSON.parse(runCommand("npm config list --json").toString())
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

export function getNpmSaveCommands(registry: string, token: string) {
  const url = new URL(registry)
  const baseUrl = url.host + url.pathname

  return [
    `npm config set //${baseUrl}:always-auth true`,
    `npm config set //${baseUrl}:_authToken "${token}"`,
  ]
}

export function saveNpmToken(token: string) {
  const registry = getRegistryUrl()
  const commands = getNpmSaveCommands(registry, token)

  commands.forEach((command) => runCommand(command))
}
