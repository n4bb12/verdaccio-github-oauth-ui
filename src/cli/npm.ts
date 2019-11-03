import { execSync } from "child_process"
import minimist from "minimist"
import { parse } from "url"

export const npmConfig = JSON.parse(execSync("npm config list --json").toString())
const args = minimist(process.argv.slice(2))

export const registry = (args.registry || npmConfig.registry).trim()
  .replace(/\/?$/, "") // Remove potential trailing slash

export function saveToken(token: string) {
  const url = parse(registry)
  execSync(`npm config set //${url.host! + url.path!}:_authToken "${token}"`)
  execSync(`npm config set //${url.host! + url.path!}:always-auth true`)
}
