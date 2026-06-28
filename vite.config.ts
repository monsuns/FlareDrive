import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite replaces the old Create React App toolchain. Output stays in `build/`
// so the Cloudflare Pages dest_dir config does not need to change.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "build" },
  server: {
    port: 3000,
    proxy: { "/webdav": "http://localhost:8788" },
  },
});
