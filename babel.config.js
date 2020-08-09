module.exports = (api) => {
  const env = api.env()
  const isTest = env === "test"
  console.log("[build]", env)

  return {
    plugins: [
      ["@babel/plugin-proposal-class-properties"],
      [
        "@babel/plugin-proposal-object-rest-spread",
        {
          useBuiltIns: "usage",
          corejs: 3,
        },
      ],
    ],
    presets: [
      [
        "@babel/preset-env",
        {
          modules: isTest ? "commonjs" : false,
          useBuiltIns: "usage",
          corejs: 3,
          targets: isTest ? { node: "current" } : undefined,
        },
      ],
      ["@babel/preset-typescript"],
    ],
  }
}
