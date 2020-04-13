const minimist = require('minimist')
const rawArgs = process.argv.slice(2)
const args = minimist(rawArgs)
const webpack = require('webpack')
const webpackConfig = require('./webpack.config')
const fs = require('fs')
const path = require('path')
const packages = fs.readdirSync(path.resolve(__dirname, './packages/'))

function getExternals (dependencies) {
  const externals = {}
  if (dependencies) {
    Object.keys(dependencies).forEach(item => {
      externals[item] = `commonjs ${item}`
    })
    return externals
  }
}

const packageWebpackConfig = {}

packages.forEach(item => {
  const stat = fs.lstatSync(path.resolve(__dirname, './packages/', item))
  const isDir = stat.isDirectory()

  const packagePath = path.resolve(__dirname, './packages/', item)
  if (isDir) {
    const { name, dependencies } = require(path.resolve(packagePath, 'package.json'))
    packageWebpackConfig[item] = {
      path: packagePath,
      name,
      externals: getExternals(dependencies)
    }
  }
})

function build (configs) {
  configs.forEach(config => {
    webpack(webpackConfig(config), (err, stats) => {
      if (err) {
        console.error(err)
        return
      }

      console.log(stats.toString({
        chunks: false,
        colors: true
      }))

      if (stats.hasErrors()) {
        return
      }

      console.log(`${config.name} 打包成功！`)
    })
  })
}

console.log(`\n===> 构建进行中，请稍后...`)

if (args.p) {
  if (packageWebpackConfig[args.p]) {
    build([packageWebpackConfig[args.p]])
  } else {
    console.error(`${args.p} 包找不到`)
  }
} else {
  build(Object.values(packageWebpackConfig))
}
