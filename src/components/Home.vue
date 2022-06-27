<template>
  <div class="home">
    <p class="title">
      The Upload File Web
    </p>
    <w3q-deployer multiple fileContract="0x3A3151fFA9eAAe92C01D85720C131322c7deD4a7" style="width: 500px"/>
  </div>
</template>

<script>
import W3qDeployer from '@/components/w3q-deployer.vue';

export default {
  name: 'Home',
  components: {W3qDeployer},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 50px;
  color: #221F33;
  line-height: 50px;
  margin-bottom: 60px;
  margin-top: 120px;
}
</style>
