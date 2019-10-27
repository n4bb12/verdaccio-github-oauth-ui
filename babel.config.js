module.exports = api => {
  const env = api.env()
  console.log("[build]", env)

  return {
    plugins: [
      ["@babel/plugin-proposal-numeric-separator"],
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
          modules: false,
          useBuiltIns: "usage",
          corejs: 3,
        },
      ],
      ["@babel/typescript"],
    ],
  }
}
