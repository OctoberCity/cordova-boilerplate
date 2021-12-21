<template>
  <div id="app">
    <img class="logo-img" alt="Vue logo" src="./assets/logo-vue.png">
    <img class="logo-img" alt="Cordova logo" src="./assets/logo-cordova.png">
    <HelloWorld
      msg="Welcome to Your Vue/Cordova App"
      :vue-version="vueVersion"
      :cordova-platform="cordovaPlatform"
      :cordova-version="cordovaVersion"
    />
  </div>
</template>

<script>
import vue from 'vue'
import HelloWorld from './components/hello-world.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data() {
    return {
      vueVersion: vue.version,
      cordovaPlatform: '',
      cordovaVersion: '',
    }
  },
  created() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  methods: {
    onDeviceReady() {
      const cordova = window.cordova;
      this.cordovaPlatform = cordova.platformId;
      this.cordovaVersion = cordova.version
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.logo-img {
  height: 150px;
}
</style>
