import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'main.ts',
  dest: 'dekinai.js',
  format: 'cjs',
  sourceMap: true,
  onwarn: (warning: any) => {
    // Skip certain warnings
    if (warning.code === 'THIS_IS_UNDEFINED') return;

    // console.warn everything else
    console.warn(warning.message);
  },
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
    })
  ]
}
