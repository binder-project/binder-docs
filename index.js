var minidocs = require('minidocs')
var include = require('include-folder')
var contents = require('./contents')

minidocs({
  contents: contents,
  markdown: include('./markdown'),
  logo: 'logo.svg'
})