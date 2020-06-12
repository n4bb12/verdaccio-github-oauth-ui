module.exports = (api) => {
  const env = api.env()
  const isTest = env === "test"
  console.log("[build]", env)

  return {
    plugins: [
      ["@babel/proposal-numeric-separator"],
      ["@babel/proposal-class-properties"],
      [
        "@babel/proposal-object-rest-spread",
        {
          useBuiltIns: "usage",
          corejs: 3,
        },
      ],
    ],
    presets: [
      [
        "@babel/env",
        {
          modules: isTest ? "commonjs" : false,
          useBuiltIns: "usage",
          corejs: 3,
          targets: isTest ? { node: "current" } : undefined,
        },
      ],
      ["@babel/typescript"],
    ],
  }
}
