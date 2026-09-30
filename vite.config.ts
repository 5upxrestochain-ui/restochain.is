import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import handler from "./api/restochain.ts";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_DATABASE_ID",
    "CLOUDFLARE_API_TOKEN",
    "APP_ORIGIN",
    "ALLOW_REGISTRATION",
    "SIGNUP_CODE",
  ]) {
    if (env[key] && process.env[key] === undefined) process.env[key] = env[key];
  }
  return {
    plugins: [
      react(),
      {
        name: "restochain-local-api",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.split("?")[0] === "/api/restochain") {
              void handler(req, res);
              return;
            }
            next();
          });
        },
      },
    ],
    server: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
      allowedHosts: ["terminal.local"],
    },
    build: { target: "es2022" },
  };
});
