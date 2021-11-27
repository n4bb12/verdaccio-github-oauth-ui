import { AllowAccess, RemoteUser } from "@verdaccio/types"
import { GitHubAuthProvider } from "src/server/github/AuthProvider"
import { PackageAccess } from "src/server/plugin/Config"
import { Plugin } from "src/server/plugin/Plugin"
import {
  createTestAuthProvider,
  createTestPackage,
  createTestPlugin,
  createTestUser,
} from "test/utils"

jest.mock("src/server/github/AuthProvider")

const AuthProvider: GitHubAuthProvider & jest.MockInstance<any, any> =
  GitHubAuthProvider as any

describe("Plugin", () => {
  describe("allow_access", () => {
    let plugin: Plugin
    let user: RemoteUser
    let pkg: AllowAccess & PackageAccess

    describe("allow_access", () => {
      beforeEach(() => {
        AuthProvider.mockImplementation(() => createTestAuthProvider())
        plugin = createTestPlugin()
      })

      it("unprotected packages can be accessed without any permission groups", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({})

        plugin.allow_access(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(true)
          done()
        })
      })

      it("protected packages cannot be accessed without the required permission group", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({ access: ["required-group"] })

        plugin.allow_access(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(false)
          done()
        })
      })

      it("protected packages can be accessed with the required permission group", (done) => {
        user = createTestUser(["required-group"])
        pkg = createTestPackage({ access: ["required-group"] })

        plugin.allow_access(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(true)
          done()
        })
      })
    })

    describe("allow_publish", () => {
      beforeEach(() => {
        AuthProvider.mockImplementation(() => createTestAuthProvider())
        plugin = createTestPlugin()
      })

      it("unprotected packages can be published without any permission groups", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({})

        plugin.allow_publish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(true)
          done()
        })
      })

      it("protected packages cannot be published without the required permission group", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({ publish: ["required-group"] })

        plugin.allow_publish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(false)
          done()
        })
      })

      it("protected packages can be published with the required permission group", (done) => {
        user = createTestUser(["required-group"])
        pkg = createTestPackage({ publish: ["required-group"] })

        plugin.allow_publish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(true)
          done()
        })
      })

      it("publish protection falls back to access protection", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({ access: ["required-group"] })

        plugin.allow_publish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(false)
          done()
        })
      })
    })

    describe("allow_unpublish", () => {
      beforeEach(() => {
        AuthProvider.mockImplementation(() => createTestAuthProvider())
        plugin = createTestPlugin()
      })

      it("unprotected packages can be unpublished without any permission groups", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({})

        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(true)
          done()
        })
      })

      it("protected packages cannot be unpublished without the required permission group", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({ unpublish: ["required-group"] })

        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(false)
          done()
        })
      })

      it("protected packages can be unpublished with the required permission group", (done) => {
        user = createTestUser(["required-group"])
        pkg = createTestPackage({ unpublish: ["required-group"] })

        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(true)
          done()
        })
      })

      it("unpublish protection falls back to publish protection", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({ publish: ["required-group"] })

        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(false)
          done()
        })
      })

      it("unpublish protection falls back to access protection", (done) => {
        user = createTestUser([])
        pkg = createTestPackage({ access: ["required-group"] })

        plugin.allow_unpublish(user, pkg, (err, granted) => {
          expect(err).toBeNull()
          expect(granted).toBe(false)
          done()
        })
      })
    })
  })
})
