import { authorizePath, callbackPath } from "./constants"

export function getAuthorizePath(id?: string) {
  return authorizePath + "/" + (id || ":id?")
}

export function getCallbackPath(id?: string) {
  return callbackPath + (id ? "/" + id : "")
}
