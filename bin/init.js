'use strict';

var fs = require('fs')
var path = require('path')
var Q = require('q')
var co = require('co')

if (require.main === module) {
  main()
}

function main() {
  co(function *() {
    yield taskCopy()
  })
    .catch(function (err) {
      console.error(err.stack)
    })
}

function *taskCopy() {
  var src
  var dest

  if ((yield existsFile(path.join(__dirname, '../config/adsense.json'))) === false) {
    src = path.join(__dirname, '../config/defaults/adsense.json')
    dest = path.join(__dirname, '../config/adsense.json')
    yield copyFile(src, dest)
  }

  if ((yield existsFile(path.join(__dirname, '../config/analytics.json'))) === false) {
    src = path.join(__dirname, '../config/defaults/analytics.json')
    dest = path.join(__dirname, '../config/analytics.json')
    yield copyFile(src, dest)
  }

  if ((yield existsFile(path.join(__dirname, '../config/url.json'))) === false) {
    src = path.join(__dirname, '../config/defaults/url.json')
    dest = path.join(__dirname, '../config/url.json')
    yield copyFile(src, dest)
  }
}

function existsFile(filename) {
  return Q.nfcall(fs.stat, filename)
    .then(function () {
      return true
    })
    .catch(function () {
      return false
    })
}

function copyFile(src, dest) {
  return co(function *() {
    var buffer = yield Q.nfcall(fs.readFile, src)
    yield Q.nfcall(fs.writeFile, dest, buffer)
  })
}
