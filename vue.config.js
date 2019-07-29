const site = require('./site')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
  transpileDependencies: ['vuetify'],
  css: {
    sourceMap: true
  },
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true
  },
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      // for templating out the html files
      title: site.title,
      description: site.description,
      author: site.author,
      keywords: site.keywords,
      gaKey: site.gaKey
    },
    embed: {
      entry: 'src/embed.js',
      template: 'public/embed.html',
      filename: 'embed.html',
      // for templating out the html files
      title: site.title,
      description: site.description,
      author: site.author,
      keywords: site.keywords
    }
  },
  pwa: {
    workboxOptions: {
      exclude: [/\.json$/, /\.map$/, /data\//]
    }
  }
}
