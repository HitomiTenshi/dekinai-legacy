import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'main.ts',
  output: {
    file: 'dekinai.js',
    format: 'cjs',
    sourcemap: false
  },
  external: [
    'better-sqlite3',
    'crypto',
    'path',
    'util',
    'url',
    'koa',
    'fs'
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig-release.json',
      clean: true
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: false
    }),
    commonjs({
      include: 'node_modules/**',
      sourceMap: false
    })
  ]
}
