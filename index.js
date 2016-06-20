var minidocs = require('minidocs')
var read = require('read-directory')
var contents = require('./contents')

var app = minidocs({
  contents: contents,
  markdown: read.sync('./markdown', { extensions: false }),
  logo: 'logo.svg',
  initial: 'start-here'
})

var tree = app.start()
document.body.appendChild(tree)