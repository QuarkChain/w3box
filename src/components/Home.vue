<template>
  <div class="home">
    <p class="title">
      Filebox is a file transfer plugin for web3q
    </p>
    <w3q-deployer multiple :fileContract="contract" style="width: 500px"/>
  </div>
</template>

<script>
import W3qDeployer from '@/components/w3q-deployer.vue';

export default {
  name: 'Home',
  components: {W3qDeployer},
  data: () => {
    return {
      contract: null,
    };
  },
  computed: {
    chainConfig() {
      return this.$store.state.chainConfig;
    }
  },
  watch: {
    chainConfig: function () {
      if (this.$store.state.chainConfig && this.$store.state.chainConfig.chainID) {
        const {FileBoxController} = this.$store.state.chainConfig;
        this.contract = FileBoxController;
      } else {
        this.contract = null;
      }
    }
  }
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
