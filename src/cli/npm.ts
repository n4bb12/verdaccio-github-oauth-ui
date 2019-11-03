import { execSync } from "child_process"
import minimist from "minimist"
import { URL } from "url"

export const npmConfig = JSON.parse(execSync("npm config list --json").toString())
const args = minimist(process.argv.slice(2))

export const registry = (args.registry || npmConfig.registry).trim()
  .replace(/\/?$/, "") // Remove potential trailing slash

export function saveToken(token: string) {
  const url = new URL(registry)
  execSync(`npm config set //${url.host + url.pathname}:_authToken "${token}"`) // lgtm [js/command-line-injection]
  execSync(`npm config set //${url.host + url.pathname}:always-auth true`)
}
