import { stringify } from "querystring"

import { logger } from "../../logger"
import { User, Verdaccio } from "../verdaccio"
import { Config, getConfig } from "./Config"

export class AuthCore {
  private readonly requiredOrgName = getConfig(this.config, "org")
  private readonly requiredTeamName = getConfig(this.config, "team")

  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly config: Config,
  ) {}

  createAuthenticatedUser(username: string, teams: string[]): User {
    // See https://verdaccio.org/docs/en/packages
    return {
      name: username,
      groups: ["$all", "@all", "$authenticated", "@authenticated"],
      real_groups: [username, this.requiredOrgName, ...teams],
    }
  }

  async createUiCallbackUrl(token: string, username: string, teams: string[]): Promise<string> {
    const user = this.createAuthenticatedUser(username, teams)

    const uiToken = await this.verdaccio.issueUiToken(user)
    const npmToken = await this.verdaccio.issueNpmToken(token, user)

    const query = { username, uiToken, npmToken }
    const url = "/?" + stringify(query)

    return url
  }

  authenticate(username: string, groups: string[], teams: string[]): boolean {
    let success = groups.includes(this.requiredOrgName)
    if (success && this.requiredTeamName){
      const reqTeams = this.requiredTeamName.split(" ")
      for( let i = 0; i < reqTeams.length; i++) {
         success = teams.includes(reqTeams[i]) 
         if (success) {
            return success
         }
      }
    }
    if (!success) {
      logger.error(this.getDeniedMessage(username))
    }

    return success
  }

  private getDeniedMessage(username: string) {
    return `Access denied: User "${username}" is not a member of "${this.requiredOrgName}"${this.requiredTeamName ? " or member of " + this.requiredTeamName + " team" : ""}`
  }
}
