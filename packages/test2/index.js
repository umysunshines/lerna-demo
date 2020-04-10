if (process.env.LOCAL_DEBUG) {
  module.exports = require('./src/index')
} else {
  module.exports = require('./dist/index')
}
