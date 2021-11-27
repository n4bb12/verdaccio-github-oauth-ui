module.exports = {
  transform: { "^.+\\.[t|j]sx?$": "babel-jest" },
  moduleFileExtensions: ["ts", "js"],
  modulePaths: ["<rootDir>"],
  collectCoverageFrom: ["src/**/*.ts"],
  snapshotResolver: "./jest.snapshotResolver.js",
}
