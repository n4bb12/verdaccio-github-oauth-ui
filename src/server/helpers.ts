import { getPublicUrl } from "@verdaccio/url"
import { Request } from "express"
import { mapValues } from "lodash"
import { ParsedPluginConfig } from "./plugin/Config"

export function getBaseUrl(config: ParsedPluginConfig, req: Request) {
  const urlPrefix = config.url_prefix

  // Stringify headers — Verdaccio requires `string`, we have `string |
  // string[] | undefined`.
  const headers = mapValues(req.headers, String)
  const verdaccioReq = { ...req, headers }

  const baseUrl = getPublicUrl(urlPrefix, verdaccioReq)
  const baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/, "")

  return baseUrlWithoutTrailingSlash
}
