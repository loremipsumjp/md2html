'use strict';

var EventEmitter = require('events').EventEmitter
var Q = require('q')
var JSZip = require('jszip')
var marked = require('marked')
var inherits = require('inherits')
var template = require('jade!./template.jade')({ partial: {} })
var fetchConfig = require('../../utils/fetch').fetchConfig
var fetchTemplate = require('../../utils/fetch').fetchTemplate

module.exports = MainComponent
module.exports.MainComponent = MainComponent

function MainComponent(options) {
  EventEmitter.call(this)

  this.config = null
  this.form = {
    configUrl: null,
    templateIndex: null,
    metadata: null,
    content: null,
    document: null,
    body: null,
    style: null,
    script: null,
  }
}

inherits(MainComponent, EventEmitter)

MainComponent.defaults = {
  template: template,
}

MainComponent.prototype.initialize = function (options) {
  var config = options.config
  var configUrl = options.configUrl
  var template = options.template

  this.config = config
  this.form.configUrl = configUrl
  this.form.templateIndex = config.defaultTemplateIndex
  this.form.metadata = template.metadata
  this.form.content = template.content
  this.form.document = template.document
  this.form.body = template.body
  this.form.style = template.style
  this.form.script = template.script
}

MainComponent.prototype.onClickLoadConfig = function (event) {
  event.preventDefault()

  var self = this

  fetchConfig(this.form.configUrl)
    .then(function (result) {
      if (result.isValid === false) {
        return Q.reject()
      }

      var config = result.config
      var configUrl = result.configUrl

      var context = {
        configUrl: configUrl,
        config: config,
      }

      return Q.all([
        Q.resolve(context),
        fetchTemplate(config.templates[config.defaultTemplateIndex]),
      ])
    })
    .then(function (results) {
      var context = results[0]
      var template = results[1]

      self.form.templateIndex = context.config.defaultTemplateIndex
      self.form.metadata = template.metadata
      self.form.content = template.content
      self.form.document = template.document
      self.form.body = template.body
      self.form.style = template.style
      self.form.script = template.script

      self.config = context.config
      window.localStorage.setItem('config-url', context.configUrl)
    })
    .catch(function (err) {
      console.error(err.stack)
    })
}

MainComponent.prototype.onClickLoadTemplate = function (event) {
  event.preventDefault()

  var self = this

  fetchTemplate(this.config.templates[this.form.templateIndex])
    .then(function (template) {
      self.form.templateIndex = context.config.defaultTemplateIndex
      self.form.metadata = template.metadata
      self.form.content = template.content
      self.form.document = template.document
      self.form.body = template.body
      self.form.style = template.style
      self.form.script = template.script
    })
}

MainComponent.prototype.onClickDownloadConfig = function (event) {
  event.preventDefault()

  var configText = JSON.stringify(this.config, null, 2)
  var href = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(configText)

  var anchor = document.createElement('a')
  anchor.setAttribute('href', href)
  anchor.setAttribute('download', 'config.json')

  var mouseEvent = document.createEvent('MouseEvents')
  mouseEvent.initMouseEvent('click', true, true, window)

  anchor.dispatchEvent(mouseEvent)
}

MainComponent.prototype.onClickDownloadTemplate = function (event) {
    event.preventDefault()

    var zip = new JSZip()
    zip.file('metadata.json', this.form.metadata)
    zip.file('content.md', this.form.content)
    zip.file('document.html', this.form.document)
    zip.file('body.html', this.form.body)
    zip.file('style.css', this.form.style)
    zip.file('script.js', this.form.script)

    var blob = zip.generate({ type: 'blob' })
    var href = window.URL.createObjectURL(blob)

    var anchor = document.createElement('a')
    anchor.setAttribute('href', href)
    anchor.setAttribute('download', 'template.zip')

    var mouseEvent = document.createEvent('MouseEvents')
    mouseEvent.initMouseEvent('click', true, true, window)

    anchor.dispatchEvent(mouseEvent)
}

MainComponent.prototype.onClickConvert = function (event) {
  event.preventDefault()

  var metadata = JSON.parse(this.form.metadata)

  metadata.md2html = {
    timestamp: new Date(),
    form: {
      metadata: this.form.metadata,
      content: this.form.content,
      document: this.form.document,
      body: this.form.body,
      style: this.form.style,
      script: this.form.script,
    },
    rendered: {},
  }

  metadata.md2html.rendered.content = marked(this.form.content)
  metadata.md2html.rendered.body = ejs.render(this.form.body, metadata)
  metadata.md2html.rendered.document = ejs.render(this.form.document, metadata)

  var href = 'data:text/html;charset=UTF-8,' + encodeURIComponent(metadata.md2html.rendered.document)

  var anchor = document.createElement('a')
  anchor.setAttribute('href', href)
  anchor.setAttribute('target', '_blank')

  var mouseEvent = document.createEvent('MouseEvents')
  mouseEvent.initMouseEvent('click', true, true, window)

  anchor.dispatchEvent(mouseEvent)
}

MainComponent.prototype.onReady = function () {
  this.emit('ready')
}

MainComponent.prototype.getVueOptions = function (options) {
  options = options || {}

  var self = this
  var data = options.data || { self: self }
  var template = options.template || MainComponent.defaults.template

  return {
    data: data,

    methods: {
      onClickLoadConfig: function (event) {
        self.onClickLoadConfig(event)
      },

      onClickLoadTemplate: function (event) {
        self.onClickLoadTemplate(event)
      },

      onClickDownloadConfig: function (event) {
        self.onClickDownloadConfig(event)
      },

      onClickDownloadTemplate: function (event) {
        self.onClickDownloadTemplate(event)
      },

      onClickConvert: function (event) {
        self.onClickConvert(event)
      },
    },

    template: template,

    ready: function () {
      self.onReady()
    },
  }
}
