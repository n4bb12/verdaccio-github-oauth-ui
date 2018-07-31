import { AuthWebUI } from './AuthWebUI'
import { BasicAuth } from './BasicAuth'

export interface Auth extends BasicAuth, AuthWebUI {
  secret: string
}
