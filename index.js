var minidocs = require('minidocs')

var app = minidocs({
  contents: './contents',
  markdown: './markdown',
  logo: 'logo.svg',
  initial: 'start-here'
})

var tree = app.start()
document.body.appendChild(tree)
