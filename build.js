var fs = require('fs')
var path = require('path')
var exec = require('child_process').exec

exec('cat repos.txt | ecosystem-docs sync && cat repos.txt | ecosystem-docs read', function (error, stdout, stderr) {
  var repositories = stdout.split('\n')
  repositories = repositories.slice(0, repositories.length - 1)
  repositories.forEach(function (repository) {
    data = JSON.parse(repository)
    fs.writeFileSync(path.join('markdown/', data.name + '.md'), data.readme)
  })
})