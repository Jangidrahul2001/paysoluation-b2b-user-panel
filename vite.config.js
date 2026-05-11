import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: env.VITE_BASENAME || "/",

    plugins: [react()],

    assetsInclude: ["**/*.lottie"],

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    server: {
      https: {
        key: fs.readFileSync("./ssl/localhost-key.pem"),
        cert: fs.readFileSync("./ssl/localhost.pem"),
      },
      host: true,
      port: 5173,

      fs: {
        deny: [
          ".env",
          ".env.*",
          "*.{crt,pem}",
          "package.json",
          "package-lock.json",
        ],
      },
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],

            "pdf-utils": ["html2canvas", "jspdf"],

            "ui-libs": [
              "framer-motion",
              "lucide-react",
              "sonner",
              "clsx",
              "tailwind-merge",
            ],
          },
        },
      },

      chunkSizeWarningLimit: 1000,
    },
  };
});