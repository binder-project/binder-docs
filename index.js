var docs = require('minidocs')
var include = require('include-folder')
var contents = require('./contents')

var theme 

docs({
  contents: contents,
  markdown: include('./markdown'),
  logo: 'logo.svg'
})