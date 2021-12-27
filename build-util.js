const { exec, execSync } = require('child_process');
const inquirer = require('inquirer');

const isServe = process.argv.includes('--serve');

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
      let devices = devicesStr.split(/\r?\n/g);
      devices = devices
        .map(device => device.replace(/device$/, '').trim())
        .filter(device => !device.startsWith('emulator-'));
      if(!devices.length) {
        console.error('Connected device not found.');
        return;
      }
    }
  }

  if(isServe) {
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
      console.error(stderr);
    } else {
      console.log(stdout);
    }
  });
  build.stdout.pipe(process.stdout);
}

async function selectPlatform() {
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
