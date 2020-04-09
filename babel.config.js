module.exports = options => {
  options.cache(true)

  const presets = [
    [
      '@babel/env',
      {
        targets: {
          node: '8.9'
        }
      }
    ]
  ]

  const plugins = []

  return {
    presets,
    plugins,
    ignore: ['node_modules']
  }
}
