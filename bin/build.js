'use strict';

var env = process.env.NODE_ENV || 'production'

var fs = require('fs')
var path = require('path')
var Q = require('q')
var co = require('co')
var cpr = require('cpr')
var rimraf = require('rimraf')
var webpack = require('webpack')
var webpackConfig = require('../webpack.config')
var adsenseConfig = require('../config/adsense.json')[env]
var analyticsConfig = require('../config/analytics.json')[env]

if (require.main === module) {
  main()
}

function main() {
  co(function *() {
    yield [
      taskClean()
    ]

    yield [
      taskCopy(),
      taskWebpack()
    ]

    yield [
      taskIndex(),
      taskRemove()
    ]
  })
    .catch(function (err) {
      console.error(err.stack)
    })
}

function *taskClean() {
  yield [
    Q.nfcall(rimraf, path.join(__dirname, '../dist/')),
    Q.nfcall(rimraf, path.join(__dirname, '../dist-sync/'))
  ]
}

function *taskCopy() {
  var src = path.join(__dirname, '../public/')
  var dest = path.join(__dirname, '../dist/')

  yield Q.nfcall(cpr, src, dest)
}

function *taskWebpack() {
  webpackConfig.entry = './src/entry.js'
  webpackConfig.plugins = [
    new webpack.DefinePlugin({
      ENV: JSON.stringify(env),
    }),
    new webpack.optimize.UglifyJsPlugin(),
  ]

  yield Q.nfcall(webpack, webpackConfig)
}

function *taskIndex() {
  var adsense = yield readFile(path.join(__dirname, '../public/partials/adsense.html')),
  adsense = adsense.replace('{{ client }}', adsenseConfig.client)
  adsense = adsense.replace('{{ slot }}', adsenseConfig.slot)
  adsense = adsense.replace('{{ format }}', adsenseConfig.format)
  adsense = JSON.stringify(adsense)
  adsense = adsense.replace(/<\/script>/g, '<\\/script>')

  var analytics = yield readFile(path.join(__dirname, '../public/partials/analytics.html')),
  analytics = analytics.replace('{{ trackingId }}', analytics.trackingId)

  var index = yield readFile(path.join(__dirname, '../public/index.html'))
  index = index.replace('/* insert:partials/adsense.html */', adsense)
  index = index.replace('<!-- insert:partials/analytics.html -->', analytics)

  yield writeFile(path.join(__dirname, '../dist/index.html'), index)
}

function *taskRemove() {
  yield [
    deleteFile(path.join(__dirname, '../dist/css/bootstrap-theme.css')),
    deleteFile(path.join(__dirname, '../dist/css/bootstrap-theme.css.map')),
    deleteFile(path.join(__dirname, '../dist/css/bootstrap.css')),
    deleteFile(path.join(__dirname, '../dist/css/bootstrap.css.map')),
    deleteFile(path.join(__dirname, '../dist/css/font-awesome.css')),
    deleteFile(path.join(__dirname, '../dist/fonts/fontawesome-webfont.eot')),
    deleteFile(path.join(__dirname, '../dist/fonts/fontawesome-webfont.svg')),
    deleteFile(path.join(__dirname, '../dist/fonts/fontawesome-webfont.ttf')),
    deleteFile(path.join(__dirname, '../dist/fonts/fontawesome-webfont.woff')),
    deleteFile(path.join(__dirname, '../dist/fonts/FontAwesome.otf')),
    deleteFile(path.join(__dirname, '../dist/fonts/glyphicons-halflings-regular.eot')),
    deleteFile(path.join(__dirname, '../dist/fonts/glyphicons-halflings-regular.svg')),
    deleteFile(path.join(__dirname, '../dist/fonts/glyphicons-halflings-regular.ttf')),
    deleteFile(path.join(__dirname, '../dist/fonts/glyphicons-halflings-regular.woff')),
    deleteFile(path.join(__dirname, '../dist/js/vendor/bootstrap.js')),
    deleteFile(path.join(__dirname, '../dist/js/vendor/bootstrap.min.js')),
    deleteFile(path.join(__dirname, '../dist/js/vendor/modernizr-2.8.3.min.js')),
    Q.nfcall(rimraf, path.join(__dirname, '../dist/partials/')),
  ]
}

function readFile(filename) {
  return Q.nfcall(fs.readFile, filename)
    .then(function (buffer) {
      return buffer.toString()
    })
}

function writeFile(filename, data) {
  return Q.nfcall(fs.writeFile, filename, data)
}

function deleteFile(filename) {
  return Q.nfcall(fs.unlink, filename)
}
