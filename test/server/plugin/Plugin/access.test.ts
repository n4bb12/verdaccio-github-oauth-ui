import { AllowAccess, RemoteUser } from "@verdaccio/types"
import { PackageAccess } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import {
  createTestAuthProvider,
  createTestPackage,
  createTestPlugin,
  createTestUser,
} from "test/utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("src/server/github/AuthProvider", () => ({
  GitHubAuthProvider: vi
    .fn()
    .mockImplementation(() => createTestAuthProvider()),
}))

describe("Plugin", () => {
  describe("allow_access", () => {
    let plugin: Plugin
    let user: RemoteUser
    let pkg: AllowAccess & PackageAccess

    describe("allow_access", () => {
      beforeEach(() => {
        plugin = createTestPlugin()
      })

      it("unprotected packages can be accessed without any permission groups", async () => {
        user = createTestUser([])
        pkg = createTestPackage({})

        await new Promise<void>((resolve) => {
          plugin.allow_access(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(true)
            resolve()
          })
        })
      })

      it("protected packages cannot be accessed without the required permission group", async () => {
        user = createTestUser([])
        pkg = createTestPackage({ access: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_access(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(false)
            resolve()
          })
        })
      })

      it("protected packages can be accessed with the required permission group", async () => {
        user = createTestUser(["required-group"])
        pkg = createTestPackage({ access: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_access(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(true)
            resolve()
          })
        })
      })
    })

    describe("allow_publish", () => {
      beforeEach(() => {
        plugin = createTestPlugin()
      })

      it("unprotected packages can be published without any permission groups", async () => {
        user = createTestUser([])
        pkg = createTestPackage({})

        await new Promise<void>((resolve) => {
          plugin.allow_publish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(true)
            resolve()
          })
        })
      })

      it("protected packages cannot be published without the required permission group", async () => {
        user = createTestUser([])
        pkg = createTestPackage({ publish: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_publish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(false)
            resolve()
          })
        })
      })

      it("protected packages can be published with the required permission group", async () => {
        user = createTestUser(["required-group"])
        pkg = createTestPackage({ publish: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_publish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(true)
            resolve()
          })
        })
      })

      it("publish protection falls back to access protection", async () => {
        user = createTestUser([])
        pkg = createTestPackage({ access: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_publish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(false)
            resolve()
          })
        })
      })
    })

    describe("allow_unpublish", () => {
      beforeEach(() => {
        plugin = createTestPlugin()
      })

      it("unprotected packages can be unpublished without any permission groups", async () => {
        user = createTestUser([])
        pkg = createTestPackage({})

        await new Promise<void>((resolve) => {
          plugin.allow_unpublish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(true)
            resolve()
          })
        })
      })

      it("protected packages cannot be unpublished without the required permission group", async () => {
        user = createTestUser([])
        pkg = createTestPackage({ unpublish: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_unpublish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(false)
            resolve()
          })
        })
      })

      it("protected packages can be unpublished with the required permission group", async () => {
        user = createTestUser(["required-group"])
        pkg = createTestPackage({ unpublish: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_unpublish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(true)
            resolve()
          })
        })
      })

      it("unpublish protection falls back to publish protection", async () => {
        user = createTestUser([])
        pkg = createTestPackage({ publish: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_unpublish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(false)
            resolve()
          })
        })
      })

      it("unpublish protection falls back to access protection", async () => {
        user = createTestUser([])
        pkg = createTestPackage({ access: ["required-group"] })

        await new Promise<void>((resolve) => {
          plugin.allow_unpublish(user, pkg, (err, granted) => {
            expect(err).toBeNull()
            expect(granted).toBe(false)
            resolve()
          })
        })
      })
    })
  })
})
