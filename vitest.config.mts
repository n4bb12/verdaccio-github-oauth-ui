import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [
      { find: "src", replacement: path.resolve(__dirname, "src") },
      { find: "test", replacement: path.resolve(__dirname, "test") },
    ],
  },
  test: {
    setupFiles: ["./vitest.setup.mts"],
  },
})
