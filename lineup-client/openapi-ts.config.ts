import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-axios",
  input: "../openapi-spec/api-spec.json",
  output: {
    postProcess: ["eslint", "prettier"],
    path: "./src/api-client",
  },
  plugins: [
    "@hey-api/schemas",
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    {
      enums: "javascript",
      name: "@hey-api/typescript",
    },
    {
      name: "@hey-api/sdk",
      transformer: true,
    },
    "zod",
    "@tanstack/react-query",
  ],
});
