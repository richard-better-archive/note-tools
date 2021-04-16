module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "oclif"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // Displays Prettier  errors as ESLint errors - must be last plugin in 'extends' array
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      modules: true,
    },
  },
};
