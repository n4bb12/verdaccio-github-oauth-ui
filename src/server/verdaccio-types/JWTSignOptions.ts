export interface JWTSignOptions {
  algorithm?: string
  expiresIn?: string
  notBefore?: string
  ignoreExpiration?: boolean
  maxAge?: string | number
  clockTimestamp?: number
}
