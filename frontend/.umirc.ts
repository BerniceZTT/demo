import { defineConfig } from 'umi';
const CompressionWebpackPlugin = require('compression-webpack-plugin');

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
  history: { type: 'hash' },

  chunks: ['vendors', 'umi'],

  chainWebpack: function (config, { webpack }) {
    config.merge({
      optimization: {
        splitChunks: {
          chunks: 'all',
          automaticNameDelimiter: '.',
          name: true,
          minSize: 30000,
          minChunks: 1,
          cacheGroups: {
            vendors: {
              name: 'vendors',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: -12,
            },
          },
        },
      },
    });
    if (process.env.NODE_ENV === 'production') {
      //gzip压缩
      config
        .plugin('compression-webpack-plugin')
        .use(CompressionWebpackPlugin, [
          {
            test: /\.js$|\.html$|\.css$/, //匹配文件名
            threshold: 10240, //对超过10k的数据压缩
            deleteOriginalAssets: false, //不删除源文件
          },
        ]);
    }
  },
});
