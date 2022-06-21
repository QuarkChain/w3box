<template>
  <div id="app">
    <div>Upload Test</div>
    <w3q-deployer drag multiple action="http://xxx" style="width: 300px"/>
  </div>
</template>

<script>
import W3qDeployer from './components/w3q-deployer.vue';

export default {
  name: 'app',
  components: {W3qDeployer},
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
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
