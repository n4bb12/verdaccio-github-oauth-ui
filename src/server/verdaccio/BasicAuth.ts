export interface BasicAuth {
  aesEncrypt(buf: Buffer): Buffer
  [index: string]: any
}
