import { afterEach } from "node:test"
import { getBaseUrl } from "src/server/helpers"
import { beforeEach, describe, expect, it } from "vitest"

describe("getBaseUrl", () => {
  beforeEach(() => {
    process.env.VERDACCIO_PUBLIC_URL = "http://verdaccio.public.url"
  })

  afterEach(() => {
    process.env.VERDACCIO_PUBLIC_URL = undefined
  })

  it("builds the correct url using VERDACCIO_PUBLIC_URL", () => {
    const baseUrl = getBaseUrl({ url_prefix: "" } as any, {} as any)

    expect(baseUrl).toMatchInlineSnapshot(`"http://verdaccio.public.url"`)
  })

  it("builds the correct url using VERDACCIO_PUBLIC_URL and url_prefix", () => {
    const baseUrl = getBaseUrl({ url_prefix: "/verdaccio" } as any, {} as any)

    expect(baseUrl).toMatchInlineSnapshot(
      `"http://verdaccio.public.url/verdaccio"`,
    )
  })

  it("doesn't produce duplicate slashes using VERDACCIO_PUBLIC_URL and url_prefix", () => {
    const baseUrl = getBaseUrl({ url_prefix: "/verdaccio/" } as any, {} as any)

    expect(baseUrl).toMatchInlineSnapshot(
      `"http://verdaccio.public.url/verdaccio"`,
    )
  })
})
