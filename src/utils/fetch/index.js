'use strict';

var Q = require('q')

module.exports = fetch
module.exports.fetch = fetch
module.exports.fetchConfig = fetchConfig
module.exports.fetchTemplate = fetchTemplate

function fetch(url) {
  return new Q.Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.send()

    xhr.addEventListener('load', function (event) {
      var xhr = event.target

      if (200 <= xhr.status && xhr.status < 300) {
        return resolve(xhr.responseText)
      }

      var err = new Error('invalid status')
      err.xhr = xhr

      return reject(err)
    })

    xhr.addEventListener('error', function (err) {
      reject(err)
    })
  })
}

function fetchConfig(configUrl) {
  return fetch(configUrl)
    .then(function (configText) {
      var config = JSON.parse(configText)

      if (typeof config.templates === 'undefined') {
        return {
          isValid: false,
          message: 'missing templates',
        }
      } else if (Array.isArray(config.templates) === false) {
        return {
          isValid: false,
          message: 'invalid templates type',
        }
      }

      if (typeof config.defaultTemplateIndex === 'undefined') {
        return {
          isValid: false,
          message: 'missing defaultTemplateIndex',
        }
      } else if (typeof config.defaultTemplateIndex !== 'number') {
        return {
          isValid: false,
          message: 'invalid defaultTemplateIndex type',
        }
      } else if (config.defaultTemplateIndex < 0 || config.templates.length <= config.defaultTemplateIndex) {
        return {
          isValid: false,
          message: 'invalid defaultTemplateIndex',
        }
      }

      return {
        isValid: true,
        configUrl: configUrl,
        config: config,
      }
    })
    .catch(function (err) {
      return {
        isValid: false,
        message: err.message,
      }
    })
}

function fetchTemplate(template) {
  return Q.all([
    fetch(template.metadataUrl),
    fetch(template.contentUrl),
    fetch(template.documentUrl),
    fetch(template.bodyUrl),
    fetch(template.styleUrl),
    fetch(template.scriptUrl),
  ])
    .then(function (results) {
      return {
        metadata: results[0],
        content: results[1],
        document: results[2],
        body: results[3],
        style: results[4],
        script: results[5],
      }
    })
}
