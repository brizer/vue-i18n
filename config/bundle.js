const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')
const uglify = require('uglify-js')

module.exports = build

//build构建命令
function build (entries) {
  let built = 0
  const total = entries.length
  //保证多种打包方式异步执行
  const next = () => {
    buildEntry(entries[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }
  next()
}
//每个入口的构建
function buildEntry (config) {
  const output = config.output
  const { file, banner } = output
  const isProd = /min\.js$/.test(file)
  //通过rollup手动api来进行打包
  return rollup.rollup(config)
    .then(bundle => bundle.generate(output))
    .then(({ code }) => {
      //拿到打包后的代码
      if (isProd) {
        //如果走.min.js流程
        var minified = (banner ? banner + '\n' : '') + uglify.minify(code, {
          fromString: true,
          output: {
            ascii_only: true
          },
          compress: {
            pure_funcs: ['makeMap']
          }
        }).code
        return write(file, minified, true)
      } else {
        //一般流程
        return write(file, code)
      }
    })
}
//写文件并提供压缩
function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) { return reject(err) }
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) { return reject(err) }
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
