const { exec, execSync } = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs-extra');

const isServe = process.argv.includes('--serve');
const buildId = Date.now();

(async () => {
  const { platform, isDevice } = await makeChoice();

  if(isServe) {
    // serve 模式下同步
    // cordova.js/cordova_plugins.js 文件
    const srcDir = `./cordova/platforms/${platform}/platform_www/`;
    const dstDir = './public/';
    fs.copySync(srcDir + 'cordova.js', dstDir + 'cordova.js');
    fs.copySync(srcDir + 'cordova_plugins.js', dstDir + 'cordova_plugins.js');

    const serve = exec('npm run serve');
    serve.stdout.pipe(process.stdout);
    serve.stdout.on('data', data => {
      const dataStr = data.toString().trim();
      const reg = /\-\sLocal:[\s]+(http:\/\/localhost:[\d]+)[\s]+\-\sNetwork:[\s]+(http:\/\/[\d.:]+)/;
      if(reg.test(dataStr)) {
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
    writeLast({ buildId, platform, isDevice });
  } else {
    const lastOpts = readLast();
    platform = await selectPlatform(lastOpts.platform);

    if(platform == 'browser') {
      writeLast({ buildId, platform, isDevice: false });
    } else {
      const mode = await selectMode(lastOpts.isDevice ? 'device' : 'emulator');
      isDevice = mode === 'device';
      writeLast({ buildId, platform, isDevice });

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

function buildApp(opts) {
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
  const { buildId, platform, isDevice } = readLast();
  if(!buildId) {
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
    let devicesStr = execSync('adb devices').toString();
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
