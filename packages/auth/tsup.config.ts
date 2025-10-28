import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/server/index.ts", "src/client/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
});
