<template>
  <div class="hello">
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
export default {
  name: 'HelloWorld',
  props: {
    msg: String,
    vueVersion: String,
    cordovaPlatform: String,
    cordovaVersion: String,
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
</style>
