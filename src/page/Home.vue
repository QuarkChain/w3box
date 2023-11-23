<template>
  <div class="home">
    <img class="home-logo" src="../assets/home.png"/>
    <div v-if="!this.aaAccount">
      <p class="title">
        To upload files silently, you need <br/> a Session Key account.
      </p>
      <button
          class="btn-create"
          @click.stop="goSession"
      >
        Create
      </button>
    </div>
    <div v-else>
      <p class="title">
        The File Hosting Service on Devnet-11,<br/>
        And use the SessionKey account to submit the transaction.
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
import EventBus from "@/utils/eventBus";

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
      return this.$store.state.sessionAddr;
    },
  },
  methods: {
    goSession() {
      if (this.account) {
        EventBus.$emit('showCreate', true);
      } else {
        this.$message.error('Please connect your wallet first!');
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
.home-logo {
  margin-top: 20px;
  width: 230px;
}

.title {
  font-size: 25px;
  color: #333333;
  margin-bottom: 55px;
  margin-top: 30px;
  line-height: 50px;
}

.drop {
  width: 550px;
  margin: 0 auto;
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
