import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'main.ts',
  dest: 'dekinai.js',
  format: 'cjs',
  sourceMap: true,
  external: [
    'crypto',
    'sqlite',
    'path',
    'util',
    'url',
    'koa',
    'fs'
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
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
      sourceMap: true
    })
  ]
}
