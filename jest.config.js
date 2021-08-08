module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "**/src/**/**/*.ts"
  ],
  setupFilesAfterEnv: [
    "./test/jest.setup.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/test/fixtures/"
  ],
  setupFiles: ["dotenv/config"]
};
