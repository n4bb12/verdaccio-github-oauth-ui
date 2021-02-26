import { logger } from "../logger"

export function respondWithCliMessage(status: string, message: string) {
  switch (status) {
    case "success":
      logger.log("All done! We've updated your npm configuration.")
      break

    case "denied":
      logger.log("You are not a member of the required org/team.")
      break

    default:
      logger.error(message)
      break
  }
}
