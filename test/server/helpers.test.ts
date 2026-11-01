import { Request } from "express"
import { getBaseUrl } from "src/server/helpers"
import { ParsedPluginConfig } from "src/server/plugin/Config"
import { afterEach, beforeEach, describe, expect, it } from "bun:test"

describe("getBaseUrl", () => {
  beforeEach(() => {
    process.env.VERDACCIO_PUBLIC_URL = "http://verdaccio.public.url"
  })

  afterEach(() => {
    process.env.VERDACCIO_PUBLIC_URL = undefined
  })

  it("builds the correct url using VERDACCIO_PUBLIC_URL", () => {
    const baseUrl = getBaseUrl(
      { url_prefix: "" } as ParsedPluginConfig,
      {} as Request,
    )

    expect(baseUrl).toMatchInlineSnapshot(`"http://verdaccio.public.url"`)
  })

  it("builds the correct url using VERDACCIO_PUBLIC_URL and url_prefix", () => {
    const baseUrl = getBaseUrl(
      { url_prefix: "/verdaccio" } as ParsedPluginConfig,
      {} as Request,
    )

    expect(baseUrl).toMatchInlineSnapshot(
      `"http://verdaccio.public.url/verdaccio"`,
    )
  })

  it("doesn't produce duplicate slashes using VERDACCIO_PUBLIC_URL and url_prefix", () => {
    const baseUrl = getBaseUrl(
      { url_prefix: "/verdaccio/" } as ParsedPluginConfig,
      {} as Request,
    )

    expect(baseUrl).toMatchInlineSnapshot(
      `"http://verdaccio.public.url/verdaccio"`,
    )
  })
})
