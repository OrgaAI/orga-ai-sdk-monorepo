import { defineConfig } from "tsup";

const entry = { init: "src/init.tsx" };

export default defineConfig([
  {
    entry,
    format: ["esm"],
    sourcemap: false,
    // sourcemap: true,
    clean: true,
    minify: true,
    dts: { entry },
    splitting: false,
    treeshake: true,
    target: "es2020",
    platform: "browser",
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env": "{}",
      process: "{}",
      global: "window",
    },
    noExternal: ["react", "react-dom", "@orga-ai/react", "@orga-ai/core"],
    outExtension: () => ({ js: ".mjs" }),
  },
  {
    entry,
    format: ["iife"],
    sourcemap: false,
    clean: false,
    minify: true,
    splitting: false,
    treeshake: true,
    target: "es2020",
    globalName: "OrgaWidget",
    platform: "browser",
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env": "{}",
      process: "{}",
      global: "window",
    },
    noExternal: ["react", "react-dom", "@orga-ai/react", "@orga-ai/core"],
    outExtension: () => ({ js: ".global.js" }),
  },
]);

