const { isAbsolute } = require("path")
const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const resolve = require("rollup-plugin-node-resolve")
const commonjs = require("rollup-plugin-commonjs")
const json = require("rollup-plugin-json")
const { terser } = require("rollup-plugin-terser")

async function createBundle(options) {
  const { target, input, output } = options

  process.env.BROWSERSLIST_ENV = target

  const bundle = await rollup({
    input,
    plugins: [
      json(),
      resolve({
        extensions: [".mjs", ".js", ".json", ".node", ".ts"],
        preferBuiltins: false,
      }),
      commonjs({
        include: "node_modules/**",
      }),
      babel({
        envName: target,
        extensions: [".ts"],
        exclude: "node_modules/**",
      }),
      target === "client" && terser(),
    ],
    external(dep) {
      return !(
        target === "client" ||
        dep === input ||
        dep.startsWith(".") ||
        isAbsolute(dep)
      )
    },
  })

  await bundle.write(output)
}

async function build() {
  const clientBundle = () =>
    createBundle({
      target: "client",
      input: `src/client/login-button.ts`,
      output: {
        file: `dist/public/login-button.js`,
        format: "umd",
      },
    })

  const serverBundle = () =>
    createBundle({
      target: "server",
      input: "src/server/index.ts",
      output: {
        file: "dist/server.js",
        format: "cjs",
        exports: "named",
      },
    })

  // FIXME:
  // Do this synchronously until this PR is merged and we can use `forwardEnv`.
  // https://github.com/babel/babel/pull/9161
  for (const bundle of [clientBundle, serverBundle]) {
    await bundle()
  }
}

build().catch(console.error)
