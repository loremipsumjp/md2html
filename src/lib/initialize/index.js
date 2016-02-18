'use strict';

var Q = require('q')
var fetchConfig = require('../../utils/fetch').fetchConfig
var fetchTemplate = require('../../utils/fetch').fetchTemplate
var urlConfig = require('json!../../../config/url.json')[ENV]

module.exports = initialize
module.exports.initialize = initialize

function initialize() {
  return initializeConfig()
    .then(function (result) {
      return initializeTemplate(result)
    })
}

function initializeConfig() {
  var configUrls = []

  if (typeof window.localStorage.getItem('config-url') === 'string') {
    configUrls.push(window.localStorage.getItem('config-url'))
  }

  configUrls.push(urlConfig.default)
  configUrls.push(urlConfig.fallback)

  var fetchConfigPromise

  if (configUrls.length === 3) {
    return fetchConfig(configUrls[0])
      .then(function (result) {
        if (result.isValid) {
          return result
        }

        window.localStorage.removeItem('config-url')

        return fetchConfig(configUrls[1])
          .then(function () {
            if (result.isValid) {
              return result
            } {
              return fetchConfig(configUrls[2])
            }
          })
      })
  } else if (configUrls.length === 2) {
    return fetchConfig(configUrls[0])
      .then(function (result) {
        if (result.isValid) {
          return result
        } else {
          return fetchConfig(configUrls[1])
        }
      })
  } else {
    throw new Error('invalid configUrls.length')
  }
}

function initializeTemplate(result) {
  if (result.isValid === false) {
    return Q.reject(result.message)
  }

  var config = result.config
  var configUrl = result.configUrl

  return fetchTemplate(config.templates[config.defaultTemplateIndex])
    .then(function (template) {
      return {
        config: config,
        configUrl: configUrl,
        template: template,
      }
    })
}
