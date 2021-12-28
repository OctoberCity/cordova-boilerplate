const fs = require('fs-extra');
const path = require('path')
const { info } = require('@vue/cli-shared-utils')

let url = 'index.html';
let mode = 'BUILD';
process.argv.forEach(arg => {
  if(arg.startsWith('--SERVE_ADDR=')) {
    url = arg.replace('--SERVE_ADDR=', '');
    mode = 'SERVE';
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
}

const iosDevComment = /\s+<!-- iOS 调试模式允许 Http -->/
const iosDevIndex = lines.findIndex(line => line.match(iosDevComment))
if (iosDevIndex >= 0) {
  info(lines[iosDevIndex - 1]);
  if(mode === 'SERVE') {
    lines[iosDevIndex - 1] = `    <allow-navigation href="${url}" />`
  } else {
    lines[iosDevIndex - 1] = `    <!-- <allow-navigation href="${url}" /> -->`
  }
}

cordovaConfig = lines.reverse().join('\n')
fs.writeFileSync(cordovaConfigPath, cordovaConfig)
