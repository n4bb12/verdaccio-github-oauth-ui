import { IBasicAuth } from "@verdaccio/types"

import { AuthWebUI } from "./AuthWebUI"

export interface Auth extends IBasicAuth<any>, AuthWebUI {
  secret: string
}
