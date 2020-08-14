import { execSync } from "child_process"
import minimist from "minimist"
import { URL } from "url"

function parseCliArgs() {
  return minimist(process.argv.slice(2))
}

function getNpmConfig() {
  return JSON.parse(execSync("npm config list --json").toString())
}

function removeTrailingSlash(input: string) {
  return input.trim().replace(/\/?$/, "")
}

function ensureTrailingSlash(input: string) {
  return input.endsWith("/") ? input : `${input}/`
}

export function getRegistry() {
  const cliArgs = parseCliArgs()
  const npmConfig = getNpmConfig()

  const registry = cliArgs.registry || npmConfig.registry

  return removeTrailingSlash(registry)
}

export function getConfigFile() {
  const npmConfig = getNpmConfig()

  return npmConfig.userconfig
}

export function getSaveCommands(registry: string, token: string) {
  const url = new URL(registry)
  const pathname = ensureTrailingSlash(url.pathname)
  const baseUrl = url.host + pathname

  return [
    `npm config set //${baseUrl}:_authToken "${token}"`,
    `npm config set //${baseUrl}:always-auth true`,
  ]
}

export function saveToken(token: string) {
  const registry = getRegistry()
  const commands = getSaveCommands(registry, token)

  commands.forEach((command) => execSync(command))
}
