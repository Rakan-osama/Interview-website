import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/spa/" : "/",
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/sanctum": "http://127.0.0.1:8000",
    },
  },
  build: {
    outDir: "../api/public/spa",
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 250,
  },
}));
