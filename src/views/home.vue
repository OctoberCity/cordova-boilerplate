<template>
  <div class="home">
    <HelloWorld msg="Welcome to Your Vue/Cordova App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/hello-world.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  }
}
</script>

<style>
.home {
  padding-top: 60px;
}
</style>
