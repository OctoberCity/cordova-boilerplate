const fs = require('fs')
const path = require('path')
const { info } = require('@vue/cli-shared-utils')

let url = 'index.html';
process.argv.forEach(arg => {
  if(arg.startsWith('--SERVE_ADDR=')) {
    url = arg.replace('--SERVE_ADDR=', '');
  }
});

const cordovaConfigPath = path.resolve(__dirname, './cordova/config.xml')
info(`updating ${cordovaConfigPath} content to ${url}`)

let cordovaConfig = fs.readFileSync(cordovaConfigPath, 'utf-8')
const lines = cordovaConfig.split(/\r?\n/g).reverse()
const regexContent = /\s+<content/
const contentIndex = lines.findIndex(line => line.match(regexContent))
if (contentIndex >= 0) {
  lines[contentIndex] = `    <content src="${url}" />`
  cordovaConfig = lines.reverse().join('\n')
  fs.writeFileSync(cordovaConfigPath, cordovaConfig)
}
