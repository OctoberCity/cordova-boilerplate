const platform = process.env.VUE_APP_CDV_PLATFORM

module.exports = {
  publicPath: '', // 替换 css/js 等文件静态路径，解决白屏问题
  outputDir: 'cordova/www', // 输出路径
  pages: {
    index: {
      entry: 'src/main.js',
      template: `public/index-${platform}.html`,
    }
  }
}
