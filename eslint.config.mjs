import globals from "globals";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier"; // Importing Prettier config

export default [
  {
    // Apply config to JavaScript and TypeScript files
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser, // Use the TypeScript parser
      sourceType: "module", // Use ES Modules
      globals: { ...globals.browser, ...globals.node }, // Include Node.js and browser globals
    },
    plugins: {
      "@typescript-eslint": tsPlugin, // TypeScript plugin
      prettier: prettierPlugin, // Prettier plugin
    },
    rules: {
      // Spread recommended ESLint rules for JS
      ...js.configs.recommended.rules,
      // Spread recommended TypeScript rules
      ...tsPlugin.configs.recommended.rules,
      // Prettier formatting issues as errors
      "prettier/prettier": "error",
    },
  },
  {
    // Configuration specific to JavaScript files
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs", // CommonJS for .js files
    },
  },
  {
    // Ignore the dist folder
    ignores: ["dist"],
  },
  {
    // Prettier config to disable conflicting ESLint rules
    rules: {
      ...prettierConfig.rules, // Apply Prettier's rule overrides
    },
  },
];
