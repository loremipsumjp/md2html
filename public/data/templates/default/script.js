(function () {
  'use strict';

  Array.prototype.slice.apply(document.querySelectorAll('img')).forEach(function (image) {
    image.parentElement.setAttribute('class', 'image')
  })

  var metadata = document.querySelector('#metadata')
  var content = document.querySelector('#content')
  var jsonButton = document.querySelector('#json')
  var markdownButton = document.querySelector('#markdown')
  var printButton = document.querySelector('#print')

  jsonButton.addEventListener('click', onClickJSON)
  markdownButton.addEventListener('click', onClickMarkdown)
  printButton.addEventListener('click', onClickPrint)

  function onClickJSON(event) {
    event.preventDefault()

    var href = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(metadata.innerHTML)

    var anchor = document.createElement('a')
    anchor.setAttribute('href', href)
    anchor.setAttribute('target', '_blank')

    var mouseEvent = document.createEvent('MouseEvents')
    mouseEvent.initMouseEvent('click', true, true, window)

    anchor.dispatchEvent(mouseEvent)
  }

  function onClickMarkdown(event) {
    event.preventDefault()

    var href = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(content.innerHTML)

    var anchor = document.createElement('a')
    anchor.setAttribute('href', href)
    anchor.setAttribute('target', '_blank')

    var mouseEvent = document.createEvent('MouseEvents')
    mouseEvent.initMouseEvent('click', true, true, window)

    anchor.dispatchEvent(mouseEvent)
  }

  function onClickPrint(event) {
    event.preventDefault()
    window.print()
  }
})();
