import { logger } from "../logger"

export function respondWithCliMessage(status: string, message: string) {
  switch (status) {
    case "success":
      logger.log("All done! We've updated your npm configuration.")
      break

    default:
      logger.error(message)
      break
  }
}
