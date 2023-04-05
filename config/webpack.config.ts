const webpack = require('webpack');

module.exports = {
  module: {
    unknownContextCritical: false,
  },
  amd: {
    toUrlUndefined: true,
  },
};
