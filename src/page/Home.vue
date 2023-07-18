<template>
  <div class="home">
    <img class="home-logo" src="../assets/home.png"/>
    <div v-if="!this.sessionKey">
      <p class="title">
        Silent upload, you need to use AA wallet and Session Key
      </p>
      <button
          class="btn-create"
          @click.stop="goAA"
      >
        Create&nbsp;&nbsp;|&nbsp;&nbsp;Manage
      </button>
    </div>
    <div v-else>
      <p class="title">
        The File Hosting Service on Arbitrum Goerli
      </p>
      <w3q-deployer multiple :fileContract="contract" :account="aaAccount" class="drop"/>
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
    aaAccount() {
      return this.$store.state.aaAccount;
    },
    sessionKey() {
      return this.$store.state.sessionKey;
    }
  },
  methods: {
    goAA(){
      this.$router.push({path: "/aa"});
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

.btn-create {
  transition: all 0.1s ease 0s;
  width: 180px;
  height: 52px;
  color: #ffffff;
  font-size: 18px;
  border: 0;
  background: #52DEFF;
  border-radius: 36px;
  cursor: pointer;
}
.btn-create:hover {
  background-color: #52DEFF90;
  border: 0;
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
