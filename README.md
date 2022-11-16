# common-app

## Project setup
```
npm install && cd cordova && mkdir www && cordova platform add (android/ios/etc)
```

### Compiles and hot-reloads for development android
```
npm run devand
```

### Compiles and minifies for production
```
npm run build  (因为dev模式中，cordova/config.xml 中src 会被修改，需要build两次)  

 apk 生成路径${projectPath}\cordova\platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
