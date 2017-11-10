module.exports = {
  globals: {
    "ts-jest": {
      skipBabel: true,
    },
  },
  mapCoverage: true,
  moduleFileExtensions: ["js", "ts"],
  transform: {
    "^.+\\.ts$": "../../node_modules/ts-jest/preprocessor.js",
  },
  testMatch: ["**/tests/**/*.test.ts"],
};
