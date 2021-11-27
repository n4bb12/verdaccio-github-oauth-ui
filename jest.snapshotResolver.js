module.exports = {
  testPathForConsistencyCheck: "some/example.test.tsx",

  resolveSnapshotPath: (testPath, snapshotExtension) => {
    return testPath + snapshotExtension
  },

  resolveTestPath: (snapshotPath, snapshotExtension) => {
    return snapshotPath.replace(snapshotExtension, "")
  },
}
