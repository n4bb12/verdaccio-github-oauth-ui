import { spyOn } from "bun:test"

// Invalid config calls process.exit. Keep the test runner alive.
spyOn(process, "exit").mockImplementation((() => {}) as typeof process.exit)
