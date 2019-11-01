import { getMajorVersion } from "src/server/plugin/Config"

describe("Config", () => {
  describe("getMajorVersion", () => {

    it("should correctly parse the version", () => {
      const version = getMajorVersion({ user_agent: "verdaccio/4.3.4" } as any)
      expect(version).toBe(4)
    })

  })
})
