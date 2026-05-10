module.exports = {
  root: true,
  extends: ["expo", "prettier"],
  ignorePatterns: ["coverage/", "node_modules/", "pnpm-lock.yaml"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error"
  },
  overrides: [
    {
      files: ["src/domain/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": [
                  "react",
                  "react-native",
                  "expo*",
                  "@supabase/*",
                  "../data/*",
                  "../../data/*",
                  "@/data/*",
                  "../ui/*",
                  "../../ui/*",
                  "@/ui/*"
                ],
                "message": "src/domain must stay pure; do not import framework, data, or UI modules."
              }
            ]
          }
        ]
      }
    }
  ]
};
