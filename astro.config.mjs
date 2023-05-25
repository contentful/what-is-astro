import { defineConfig } from "astro/config";

export default defineConfig({
  output: "hybrid",
  experimental: {
    hybridOutput: true,
  },
});
