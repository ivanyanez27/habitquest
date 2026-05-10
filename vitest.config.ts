import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/domain/**/*.ts"],
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 90
      }
    },
    environment: "node",
    globals: true,
    include: ["tests/domain/**/*.test.ts"]
  }
});
