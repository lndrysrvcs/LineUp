import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || 5173;
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port,
      strictPort: true,
      proxy: {
        "/api": env.services__api__http__0,
      },
    },
    test: {
      environment: "jsdom",
      coverage: {
        enabled: true,
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/**/*.d.ts", "src/api-client/**", "src/utils/api/**", "src/main.tsx"],
      },
    },
  };
});
