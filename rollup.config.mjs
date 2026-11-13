import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import json from "@rollup/plugin-json"
import terser from "@rollup/plugin-terser"
import svelte from "rollup-plugin-svelte"
import postcss from "rollup-plugin-postcss"
import * as tar from "tar"
import fs from "fs"
import crypto from "crypto"

const pkg = JSON.parse(fs.readFileSync(new URL("./package.json", import.meta.url), "utf8"))

const ignoredWarnings = ["css_unused_selector", "a11y_no_static_element_interactions"]

// Remove old tarballs before building
const clean = () => ({
  buildStart() {
    if (fs.existsSync("./dist/")) {
      for (const file of fs.readdirSync("./dist/")) {
        if (file.endsWith(".tar.gz")) fs.unlinkSync(`./dist/${file}`)
      }
    }
  },
})

// Copy schema.json and package.json into dist, add the bundle hash and
// version to the schema, then pack everything into the plugin tarball
const bundle = () => ({
  async writeBundle() {
    fs.copyFileSync("./schema.json", "./dist/schema.json")
    fs.copyFileSync("./package.json", "./dist/package.json")
    const hash = crypto
      .createHash("sha1")
      .update(fs.readFileSync("dist/plugin.min.js"))
      .digest("hex")
    const schema = JSON.parse(fs.readFileSync("./dist/schema.json", "utf8"))
    fs.writeFileSync(
      "./dist/schema.json",
      JSON.stringify({ ...schema, hash, version: pkg.version }, null, 2)
    )
    await tar.c({ gzip: true, cwd: "dist", file: `dist/${pkg.name}-${pkg.version}.tar.gz` }, [
      "plugin.min.js",
      "schema.json",
      "package.json",
    ])
  },
})

export default {
  input: "index.js",
  // Svelte is provided by the Budibase client at runtime, never bundle it
  external: id => id === "svelte" || id.startsWith("svelte/"),
  output: {
    format: "iife",
    file: "dist/plugin.min.js",
    name: "plugin",
    globals: id => {
      if (id === "svelte/store") return "svelteStore"
      if (id === "svelte/transition") return "svelteTransition"
      if (id === "svelte/animate") return "svelteAnimate"
      if (id === "svelte/motion") return "svelteMotion"
      if (id === "svelte/easing") return "svelteEasing"
      if (id === "svelte/events") return "svelteEvents"
      if (id.includes("/internal")) return "svelteInternal"
      return "svelte"
    },
  },
  plugins: [
    clean(),
    svelte({
      emitCss: true,
      onwarn: (warning, handler) => {
        if (!ignoredWarnings.includes(warning.code)) handler(warning)
      },
    }),
    postcss(),
    resolve({ browser: true }),
    commonjs(),
    json(),
    terser(),
    bundle(),
  ],
}
