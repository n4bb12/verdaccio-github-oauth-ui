import { authenticatedUserGroups } from "../../constants"
import { logger } from "../../logger"
import { User } from "./Verdaccio"

export class AuthCore {
  async createAuthenticatedUser(userName: string): Promise<User> {
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
}
