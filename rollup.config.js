import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/extension.ts",
  output: {
    dir: "out",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
};
