'use strict';

var port = parseInt(process.env.NODE_ENV || '3000', 10)

var http = require('http')
var path = require('path')
var morgan = require('morgan')
var connect = require('connect')
var serveStatic = require('serve-static')

if (require.main === module) {
  main()
}

function main() {
  var app = connect()

  app.use(morgan('dev'))
  app.use(serveStatic(path.join(__dirname, '../dist/')))

  var server = http.createServer(app)

  server.on('listening', onListening)
  server.on('error', onError)
  server.listen(port)
}

function onListening() {
  console.log('Listening on ' + port)
}

function onError(err) {
  console.error(err.stack)
}
