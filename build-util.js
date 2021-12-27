const { exec, execSync } = require('child_process');
const inquirer = require('inquirer');

async function selectPlatform() {
  const { platform } = await inquirer
    .prompt([{ 
      message: 'Which platform?',
      type: 'list', 
      name: 'platform', 
      choices: [
        'browser',
        'android',
        'ios',
      ],
      default: 'android' 
    }]);
  return platform;
}

async function selectMode() {
  const { mode } = await inquirer
    .prompt([{ 
      message: 'Run on device or emulator?',
      type: 'list', 
      name: 'mode', 
      choices: [
        'device',
        'emulator',
      ],
      default: 'device' 
    }]);
  return mode;
}

(async () => {
  const platform = await selectPlatform();
  let isDevice = true;
  if(platform !== 'browser') {
    const mode = await selectMode();
    isDevice = mode === 'device';

    if (platform === 'android') {
      let devicesStr = execSync('adb devices').toString();
      devicesStr = devicesStr
        .replace('List of devices attached', '')
        .trim();
      let devices = devicesStr.split(/\r?\n/);
      devices = devices
        .map(device => device.replace(/device$/, '').trim())
        .filter(device => !device.startsWith('emulator-'));
      if(!devices.length) {
        console.error('Connected device not found.');
        return;
      }
    }
  }

  const serve = exec('npm run serve');
  serve.stdout.pipe(process.stdout);
  serve.stdout.on('data', data => {
    const dataStr = data.toString().trim();
    const reg = /\-\sLocal:[\s]+(http:\/\/localhost:[\d]+)[\s]+\-\sNetwork:[\s]+(http:\/\/[\d.:]+)/;
    if(reg.test(dataStr)) {
      const mathes = dataStr.match(reg);
      const localHost = mathes[1];
      const lanHost = mathes[2];
      console.log(platform, localHost, lanHost)

      process.nextTick(() => {
        if(platform === 'browser') {
          exec(`open "${localHost}"`);
        } else if (platform === 'android') {
          const build = exec(`cordova run android --SERVE_ADDR=${lanHost} ${ isDevice ? '--device' : '--emulator' }`, {
            cwd: './cordova',
          }, (error, stdout, stderr) => {
            if(error) {
              console.error(stderr);
            } else {
              console.log(stdout);
            }
          });
          build.stdout.pipe(process.stdout);
        } else if (platform === 'ios') {
          const build = exec(`cordova run ios --SERVE_ADDR=${lanHost} ${ isDevice ? '--device' : '--emulator' }`, {
            cwd: './cordova',
          }, (error, stdout, stderr) => {
            if(error) {
              console.error(stderr);
            } else {
              console.log(stdout);
            }
          });
          build.stdout.pipe(process.stdout);
        }
      });
    }
  });
})();
