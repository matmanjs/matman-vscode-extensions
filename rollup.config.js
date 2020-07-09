import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/extension.ts',
  external: ['vscode', 'child_process', 'os'],
  output: {
    dir: 'out',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs({extensions: ['.js', '.ts']}),
  ],
};
