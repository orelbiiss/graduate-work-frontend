const config = {
  preset: 'esm',
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    transform: {
      "^.+\\.jsx?$": "babel-jest"
    },
    testEnvironment: "jsdom", 
    globals: {
      NODE_ENV: "test"
    }, 
    runner: "jest-runner",
    moduleFileExtensions: ["js", "json", "node"],
};

module.exports = config;