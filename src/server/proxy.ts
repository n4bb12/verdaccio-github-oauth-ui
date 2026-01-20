import dotenv from "dotenv"
import { ProxyAgent, fetch as undiciFetch } from "undici"
import { logger } from "../logger"

dotenv.config()

const proxy =
  process.env.https_proxy ||
  process.env.HTTPS_PROXY ||
  process.env.http_proxy ||
  process.env.HTTP_PROXY

if (proxy) {
  logger.log(`Using proxy server: ${proxy}`)
}

const proxyAgent = proxy ? new ProxyAgent(proxy) : undefined

const proxyFetch: typeof undiciFetch = async (url, options) => {
  try {
    const response = await undiciFetch(url, {
      ...options,
      dispatcher: proxyAgent,
    })
    logger.log(`Proxy fetch response: ${response.status}`)
    return response
  } catch (error) {
    logger.log(`Proxy fetch error: ${error}`)
    throw error
  }
}

export const fetchWithProxySupport = proxy ? proxyFetch : undiciFetch
