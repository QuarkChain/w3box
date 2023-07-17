<template>
  <div class="home">
    <img class="home-logo" src="../assets/home.png"/>
    <p class="title">
      The File Hosting Service on Web3Q
    </p>
    <w3q-deployer multiple :fileContract="contract" :account="account" class="drop"/>
  </div>
</template>

<script>
import W3qDeployer from '@/components/w3q-deployer.vue';

// const { getZeroDevSigner, getRPCProviderOwner, createSessionKey } = require('@zerodevapp/sdk')

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
    account() {
      return this.$store.state.account;
    }
  },
  // async created() {
  //   const projectId = '1ca3939f-3e50-4aef-a4bd-7b86eb45ffde';
  //   const wallet = getRPCProviderOwner(window.ethereum);
  //   const signer = await getZeroDevSigner({
  //     projectId,
  //     owner: wallet,
  //   });
  //   const address = await signer.getAddress()
  //   console.log('My address:', address)
  //
  //   const sessionKeyTime = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  //   const sessionKey = await createSessionKey(
  //       signer,
  //       [],
  //       sessionKeyTime,
  //   );
  //   console.log('My address:', sessionKey)
  // }
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
  margin-top: 35px;
  width: 230px;
}

.title {
  font-size: 30px;
  color: #333333;
  margin-bottom: 55px;
  margin-top: 30px;
  line-height: 50px;
}

.drop {
  width: 600px
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
