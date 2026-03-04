import { getPublicUrl } from "@verdaccio/url"
import { Application, Request } from "express"
import { ParsedPluginConfig } from "./plugin/Config"
import { authenticatedUserGroups } from "../constants"
import { logger } from "../logger"
import { User } from "./plugin/Verdaccio"

export function getBaseUrl(config: ParsedPluginConfig, req: Request) {
  const urlPrefix = config.url_prefix

  const baseUrl = getPublicUrl(urlPrefix, req)
  const baseUrlWithoutTrailingSlash = baseUrl.replace(/\/$/, "")

  return baseUrlWithoutTrailingSlash
}

export function createAuthenticatedUser(userName: string): User {
  const user: User = {
    name: userName,
    groups: [...authenticatedUserGroups],
    // groups returned by GH are not used here and not saved in the JWT token
    // to avoid Verdaccio granting access based on the outdated groups
    real_groups: [],
  }

  logger.log("User successfully authenticated:", user)
  return user
}

export interface IPluginMiddleware {
  register_middlewares(app: Application): void
}
