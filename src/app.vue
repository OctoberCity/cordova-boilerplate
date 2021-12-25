<template>
  <div id="app">
    <router-view/>
    <van-tabbar route>
      <van-tabbar-item replace to="/home" icon="home-o">主页</van-tabbar-item>
      <van-tabbar-item replace to="/about" icon="friends-o">关于</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  created() {
    // 路由初始化
    if (this.$route.path === '/') {
      this.$router.push('/home');
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
}
</style>
