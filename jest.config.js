module.exports = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  modulePaths: ["<rootDir>"],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/"],
}
