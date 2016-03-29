var docs = require('minidocs')
var contents = require('./contents')

var theme 

docs(contents, {
  logo: 'logo.svg',
  style: true
})