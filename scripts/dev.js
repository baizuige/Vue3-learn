// 打包 packages 下面的模块，输出 js 文件
// node dev.js 要打包的名字 -f 打包的格式

import minimist from 'minimist'
import { createRequire } from 'module'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'
// node 命令行参数通过 process 获取 process.argv
const args = minimist(process.argv.slice(2))
// file:* -> /url
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

// 打包的项目
const target = args._[0] || 'reactivity'
// 打包的目标格式
const format = args.f || 'iife'

console.log(target, format)

// node 中 esm 模块没有 __dirname
// console.log(__filename, __dirname, require)

// 入口 
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
const pkg = require(`../packages/${target}/package.json`)
esbuild.context({
  entryPoints: [entry], // 入口
  outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 出口
  bundle: true, // 打包到一起
  platform: 'browser', // 浏览器使用
  sourcemap: true,
  format,
  globalName: pkg.buildOptions?.name // 打包后的全局变量名字
}).then((ctx) => {
  console.log('start dev')
  return ctx.watch()
})

