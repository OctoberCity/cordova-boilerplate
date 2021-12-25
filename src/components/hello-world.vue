<template>
  <div>
    <img class="logo-img" alt="Vue logo" src="../assets/logo-vue.png">
    <img class="logo-img" alt="Cordova logo" src="../assets/logo-cordova.png">
    <h1>{{ msg }}</h1>
    <h3>Vue info</h3>
    <ul>
      <li>version: {{vueVersion}}</li>
    </ul>
    <h3>Cordova info</h3>
    <ul>
      <li>platform: {{cordovaPlatform}}</li>
      <li>version: {{cordovaVersion}}</li>
    </ul>
  </div>
</template>

<script>
import vue from 'vue'

export default {
  name: 'HelloWorld',
  props: {
    msg: String,
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.logo-img {
  height: 150px;
}
</style>
