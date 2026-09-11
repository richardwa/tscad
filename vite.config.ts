import path from "path";
import { defineConfig, ViteDevServer } from "vite";
import express from "express";import { configureRoutes } from "./src/server/routes.ts";

const expressPlugin = () => ({
  name: "vite-plugin-express",
  configureServer(server: ViteDevServer) {
    const app = express();
    configureRoutes(app);
    server.middlewares.use(app);
  },
});

export default defineConfig({
  root: "src/client",
  server: {
    port: 5178,
    host: true,
    allowedHosts: true,
    strictPort: true,
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  plugins: [expressPlugin()],
});
