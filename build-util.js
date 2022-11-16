/* eslint-disable */
const { exec, execSync } = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs-extra');

const isServe = process.argv.includes('--serve');

(async () => {
  const { platform, isDevice } = await makeChoice();

  if(isServe) {
    copyPlatformsCordovaJs(platform);
    copyPlatformsHtml(platform);

    execSync(`npm run dev-build -- --mode=${platform}`);
    const serve = exec(`npm run serve -- --mode=${platform}`);
    serve.stdout.pipe(process.stdout);
    let firstTime = true;
    serve.stdout.on('data', data => {
      if(!firstTime) { return }
      
      const dataStr = data.toString().trim();
      const reg = /\-\sLocal:[\s]+(http:\/\/localhost:[\d]+)[\s]+\-\sNetwork:[\s]+(http:\/\/[\d.:]+)/;
      if(reg.test(dataStr) ) {
        firstTime = false;
        const mathes = dataStr.match(reg);
        const localHost = mathes[1];
        const lanHost = mathes[2];

        process.nextTick(() => {
          if(platform === 'browser') {
            exec(`open "${localHost}"`);
          } else {
            buildApp({
              platform,
              isServe,
              lanHost,
              isDevice
            });
          }
        });
      }
    });
  } else {
    execSync('vue-cli-service build', { stdio: 'inherit' });
    buildApp({
      platform,
      isDevice
    });
  }
})();

function writeLast(opts) {
  fs.writeJSONSync('./.build.json', opts);
}
function readLast() {
  if(fs.existsSync('./.build.json')) {
    return fs.readJSONSync('./.build.json');
  } else {
    return {};
  }
}

async function makeChoice() {
  const last = await useLast();
  let platform = null;
  let isDevice = true;
  if(last) {
    platform = last.platform;
    isDevice = last.isDevice;
    writeLast({ platform, isDevice });
  } else {
    const lastOpts = readLast();
    platform = await selectPlatform(lastOpts.platform);

    if(platform == 'browser') {
      writeLast({ platform, isDevice: false });
    } else {
      const mode = await selectMode(lastOpts.isDevice ? 'device' : 'emulator');
      isDevice = mode === 'device';
      writeLast({ platform, isDevice });

      if(isDevice) {
        devices = listDevices(platform);
        if(!devices.length) {
          throw new Error('Connected device not found.');
        }
      }
    }
  }

  return {
    platform,
    isDevice,
  }
}

function cleanUp() {
  // cordova clean 的 bug，ios 下的 build 需要自己删除
  // execSync('rm -rf build/', {
  //   cwd: './cordova/platforms/ios',
  //   stdio: 'inherit',
  // });

  execSync('cordova clean', {
    cwd: './cordova',
    stdio: 'inherit',
  });

  console.log('\ncordova cleaned up!\n');
}

// serve 模式下同步 platform_www 下的文件到 public
function copyPlatformsCordovaJs(platform) {
  const srcDir = `./cordova/platforms/${platform}/platform_www/`;
  const dstDir = `./public/dev-build/${platform}/`;
  fs.copySync(srcDir, dstDir);
}

function copyPlatformsHtml(platform) {
  const srcFile = `./public/index.html`;
  const dstFile = `./public/dev-build/index-${platform}.html`;
  const lines = fs.readFileSync(srcFile, 'utf-8').split(/\r?\n/g);
  
  const regexImportComment = /\s+<!-- 引入 cordova.js -->/
  const importCommentIndex = lines.findIndex(line => line.match(regexImportComment));
  if (importCommentIndex >= 0) {
    lines[importCommentIndex + 1] = `    <script src="dev-build/${platform}/cordova.js"></script>`;
  }

  if(platform === 'browser') {
    const regexDisableComment = /\s+<!-- 调试模式下 platform===browser 时禁用网页端 CSP -->/
    const disableCommentIndex = lines.findIndex(line => line.match(regexDisableComment));
    if (disableCommentIndex >= 0 && platform === 'browser') {
      const cspLine = lines[disableCommentIndex + 1];
      lines[disableCommentIndex + 1] = cspLine
        .replace('<meta', '<!-- <meta')
        .replace(/>$/, '> -->');
    }
  }

  fs.writeFileSync(dstFile, lines.join('\n'))
}

function buildApp(opts) {
  cleanUp();

  const { platform, isServe, lanHost, isDevice } = opts;

  let cmd = `cordova run ${platform}`;
  if(isServe) {
    cmd += ` --SERVE_ADDR=${lanHost}`;
  }
  cmd += ` ${ isDevice ? '--device' : '--emulator' }`;
  const build = exec(cmd, {
    cwd: './cordova',
  }, (error, stdout, stderr) => {
    if(error) {
      console.error(error, stderr);
    } else {
      console.log(stdout);
    }
  });
  build.stdout.pipe(process.stdout);
}

async function useLast() {
  const { platform, isDevice } = readLast();
  if(!platform) {
    return false;
  }

  let lastStr = 'browser';
  if(platform !== 'browser') {
    lastStr = `${platform} ${isDevice ? 'device': 'emulator'}`
  }

  const { last } = await inquirer
    .prompt([{
      message: 'Use last build potions?',
      type: 'list',
      name: 'last',
      choices: [{
        name: `last build on [${lastStr}]`,
        value: true,
      }, {
        name: `select again`,
        value: false,
      }],
      default: 'device' 
    }]);
  return last && { platform, isDevice };
}

async function selectPlatform(last) {
  const platforms = [
    'android',
    'ios',
  ];
  if(isServe) {
    platforms.unshift('browser');
  }

  const { platform } = await inquirer
    .prompt([{
      message: 'Which platform?',
      type: 'list',
      name: 'platform',
      choices: platforms,
      default: last || 'android', 
    }]);
  return platform;
}

async function selectMode(last) {
  const { mode } = await inquirer
    .prompt([{
      message: 'Run on device or emulator?',
      type: 'list',
      name: 'mode',
      choices: [
        'device',
        'emulator',
      ],
      default: last || 'device',
    }]);
  return mode;
}

function listDevices(platform) {
  let devices = [];
  if (platform === 'android') {
    let devicesStr = execSync('D:/android/SDK/platform-tools/adb.exe devices').toString();
    devicesStr = devicesStr
      .replace('List of devices attached', '')
      .trim();
    devices = devicesStr.split(/\r?\n/g);
    devices = devices
      .map(device => device.replace(/device$/, '').trim())
      .filter(device => !device.startsWith('emulator-'));
  }
  if (platform === 'ios') {
    let devicesStr = execSync('xcrun xctrace list devices').toString();
    devicesStr = devicesStr
      .replace(/^== Devices ==/, '')
      .replace(/== Simulators ==[\w\W]*$/, '')
      .trim();
    devices = devicesStr.split(/\r?\n/g);
    const iosReg = /^[\w\W]* \([0-9.]+\) \(([0-9a-f]+)\)$/;
    devices = devices
      .filter(device => iosReg.test(device))
      .map(device => device.match(iosReg)[1]);
  }
  return devices;
}
