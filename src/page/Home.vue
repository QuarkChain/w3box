<template>
  <div class="home">
    <img class="home-logo" src="../assets/home.png"/>
    <div>
      <p class="title">
        The File Hosting Service on Polygon Mumbai,<br/>
        And use the AA wallet to submit the transaction.
      </p>
      <w3q-deployer multiple
                    :fileContract="contract"
                    :fdContract="fdContract"
                    :account="account"
                    :aaAccount="aaAccount"
                    class="drop"/>
    </div>
  </div>
</template>

<script>
import W3qDeployer from '@/components/w3q-deployer.vue';

export default {
  name: 'HomePage',
  components: {W3qDeployer},
  computed: {
    contract() {
      if (this.$store.state.chainConfig && this.$store.state.chainConfig.chainID) {
        const {FileBoxController} = this.$store.state.chainConfig;
        return FileBoxController;
      }
      return null;
    },
    fdContract() {
      if (this.$store.state.chainConfig && this.$store.state.chainConfig.chainID) {
        const {FDContract} = this.$store.state.chainConfig;
        return FDContract;
      }
      return null;
    },
    account() {
      return this.$store.state.account;
    },
    aaAccount() {
      return this.$store.state.aaAddress;
    },
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
.home-logo {
  margin-top: 20px;
  width: 230px;
}

.title {
  font-size: 25px;
  color: #333333;
  margin: 30px 0;
  line-height: 30px;
}

.drop {
  width: 550px
}

@media screen and (max-width: 500px) {
  .home-logo {
    margin-top: 35px;
    width: 180px;
  }

  .title {
    font-size: 22px;
    margin-bottom: 30px;
    margin-top: 30px;
    line-height: 30px;
  }

  .drop {
    width: 98%
  }
}
</style>
