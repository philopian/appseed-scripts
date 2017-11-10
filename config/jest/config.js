const path = require("path");

module.exports = {
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/www/**/__tests__/**/*.js?(x)",
    "<rootDir>/www/**/?(*.)(spec|test).js?(x)"
  ],
  collectCoverageFrom: ["www/**/*.{js,jsx}"],
  moduleNameMapper: { "^react-native$": "react-native-web" },
  moduleFileExtensions: ["web.js", "js", "json", "web.jsx", "jsx", "node"],
  "transform": {
    "^.+\\.(js|jsx)$": path.join(__dirname, "/preprocessor.js")
  }
};