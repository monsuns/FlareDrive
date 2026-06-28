import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite replaces the old Create React App toolchain. Output stays in `build/`
// so the Cloudflare Pages dest_dir config does not need to change.
// manualChunks splits stable vendor code (MUI, markdown) into separate chunks
// so the app chunk stays small and vendor chunks cache across deploys.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("/@mui/") || id.includes("/@emotion/")) return "mui";
          if (
            id.includes("react-markdown") ||
            id.includes("/remark-") ||
            id.includes("/micromark") ||
            id.includes("/mdast") ||
            id.includes("/unified/") ||
            id.includes("/hast-") ||
            id.includes("/unist-") ||
            id.includes("/vfile")
          )
            return "markdown";
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: { "/webdav": "http://localhost:8788" },
  },
});
