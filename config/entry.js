const path = require('path')
const replace = require('rollup-plugin-replace')
const flow = require('rollup-plugin-flow-no-whitespace')
const buble = require('rollup-plugin-buble')
const node = require('rollup-plugin-node-resolve')
const cjs = require('rollup-plugin-commonjs')
const banner = require('./banner')
const pack = require('../package.json')

function toUpper (_, c) {
  return c ? c.toUpperCase() : ''
}

const resolve = _path => path.resolve(__dirname, '../', _path)
const classifyRE = /(?:^|[-_\/])(\w)/g
function classify (str) {
  return str.replace(classifyRE, toUpper)
}
const moduleName = classify(pack.name)

//定义不同打包文件的 配置定义
const entries = {
  commonjs: {
    entry: resolve('src/index.js'),
    dest: resolve(`dist/${pack.name}.common.js`),
    format: 'cjs',
    banner
  },
  esm: {
    entry: 'src/index.js',
    dest: resolve(`dist/${pack.name}.esm.js`),
    format: 'es',
    banner
  },
  production: {
    entry: 'src/index.js',
    dest: resolve(`dist/${pack.name}.min.js`),
    format: 'umd',
    env: 'production',
    moduleName,
    banner
  },
  development: {
    entry: 'src/index.js',
    dest: resolve(`dist/${pack.name}.js`),
    format: 'umd',
    env: 'development',
    moduleName,
    banner
  }
}

//将自定义配置和rollup的配置进行映射
function genConfig (opts) {
  const config = {
    input: opts.entry,
    output: {
      file: opts.dest,
      name: moduleName,
      format: opts.format,
      banner: opts.banner
    },
    plugins: [
      flow(),
      node(),
      cjs(),
      buble()
    ]
  }

  const replacePluginOptions = { '__VERSION__': pack.version }
  if (opts.env) {
    replacePluginOptions['process.env.NODE_ENV'] = JSON.stringify(opts.env)
  }
  config.plugins.push(replace(replacePluginOptions))

  return config
}

exports.getEntry = name => genConfig(entries[name])
exports.getAllEntries = () => Object.keys(entries).map(name => genConfig(entries[name]))
