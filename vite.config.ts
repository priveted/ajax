import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL("./src/ajax.ts", import.meta.url))),
      name: "ajax",
      fileName: (format) => {
        if (format === "es") return "ajax.js";
        if (format === "umd") return "ajax.umd.cjs";
        return "ajax.js";
      },
      formats: ["es", "umd"] as ["es", "umd"]
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  },
  plugins: [
    dts({
      // Плагин для генерации .d.ts
      insertTypesEntry: true, // Добавляет ссылку на типы в package.json
      include: ["src"]
    })
  ]
});
