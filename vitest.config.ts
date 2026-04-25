import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Allow TypeScript source files to be resolved when tests import using .js extensions
    extensions: [".ts", ".js"],
  },
  test: {
    include: ["src/tests/**/*.test.ts"],
  },
});
