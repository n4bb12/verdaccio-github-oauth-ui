import { getPublicUrl } from "@verdaccio/url"
import { Application, Request } from "express"
import { ParsedPluginConfig } from "./plugin/Config"

export function getBaseUrl(config: ParsedPluginConfig, req: Request) {
  const urlPrefix = config.url_prefix

  const baseUrl = getPublicUrl(urlPrefix, req)
  const baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/, "")

  return baseUrlWithoutTrailingSlash
}

export interface IPluginMiddleware {
  register_middlewares(app: Application): void
}
