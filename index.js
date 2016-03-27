var docs = require('minidocs')
var contents = require('./contents')

var theme 

docs({
  contents: contents,
  logo: 'logo.svg'
})

// minidocs contents.json folder -o build

// build/index.html
// build/index.js