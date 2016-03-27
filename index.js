var docs = require('minidocs')
var contents = require('./contents')

var theme 

docs({
  contents: contents,
  logo: 'logo.svg'
})