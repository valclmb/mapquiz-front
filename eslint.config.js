import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  globalIgnores([
    "dist",
    "**/*.test.*",
    "**/*.spec.*",
    "**/__tests__/**",
    "src/components/ui/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "**/*.test.*",
      "**/*.spec.*",
      "**/__tests__/**",
      "src/components/ui/**",
    ],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);
