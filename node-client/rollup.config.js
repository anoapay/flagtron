import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: "dist",
          emitDeclarationOnly: false,
        },
      },
      include: ["src/**/*.ts"],
    }),
  ],
  external: ["axios", "redis", "ws"],
};
