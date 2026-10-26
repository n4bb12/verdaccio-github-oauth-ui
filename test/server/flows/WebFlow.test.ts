import express from "express"
import { AddressInfo } from "node:net"
import { Server } from "node:http"
import { WebFlow } from "src/server/flows"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  createTestAuthProvider,
  createTestParsedPluginConfig,
  createTestVerdaccio,
  testLoginUrl,
} from "test/utils"

describe("WebFlow", () => {
  let server: Server | undefined

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server!.close(resolve))
    }
    server = undefined
  })

  async function startApp() {
    const provider = createTestAuthProvider()
    const getLoginUrl = vi.spyOn(provider, "getLoginUrl")
    const webFlow = new WebFlow(
      createTestVerdaccio(),
      createTestParsedPluginConfig(),
      provider,
    )

    const app = express()
    webFlow.register_middlewares(app)

    server = app.listen(0)
    await new Promise((resolve) => server!.once("listening", resolve))
    const { port } = server.address() as AddressInfo

    return { baseUrl: `http://localhost:${port}`, getLoginUrl }
  }

  it("registers its routes on an Express 5 app", () => {
    const webFlow = new WebFlow(
      createTestVerdaccio(),
      createTestParsedPluginConfig(),
      createTestAuthProvider(),
    )

    expect(() => webFlow.register_middlewares(express())).not.toThrow()
  })

  it("redirects /-/oauth/authorize to the provider login", async () => {
    const { baseUrl, getLoginUrl } = await startApp()

    const response = await fetch(`${baseUrl}/-/oauth/authorize`, {
      redirect: "manual",
    })

    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe(testLoginUrl)
    expect(getLoginUrl).toHaveBeenCalledWith(`${baseUrl}/-/oauth/callback`)
  })

  it("passes the id of /-/oauth/authorize/:id to the callback url", async () => {
    const { baseUrl, getLoginUrl } = await startApp()

    const response = await fetch(`${baseUrl}/-/oauth/authorize/cli`, {
      redirect: "manual",
    })

    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe(testLoginUrl)
    expect(getLoginUrl).toHaveBeenCalledWith(`${baseUrl}/-/oauth/callback/cli`)
  })
})
