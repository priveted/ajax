import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(fileURLToPath(new URL("./src/ajax.ts", import.meta.url))),
      name: "ajax",
      fileName: (format) => {
        if (format === "es") return "ajax.mjs";
        if (format === "umd") return "ajax.umd.js";
        return `ajax.${format}.js`;
      },
      formats: ["es", "umd"]
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src", "types"],
      outDir: "dist",
      entryRoot: "src",
      rollupTypes: false,
      copyDtsFiles: true
    }),
    viteStaticCopy({
      targets: [
        {
          src: "types/*.d.ts",
          dest: "types"
        }
      ]
    })
  ]
});
