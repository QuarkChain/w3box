<template>
  <div id="session">
    <div v-if="this.aaAddress" class="wallet" @click="openDialog">
      <div class="wallet-img"/>
      <p class="balance">{{ this.balance }} ETH</p>
    </div>
    <div v-else class="no-show" />

    <b-modal v-model="isShow"
             :canCancel="false"
             has-modal-card
             trap-focus>
      <SessionCard/>
    </b-modal>
  </div>
</template>

<script>
import {queryBalance} from "@/utils/Particle";
import BigNumber from 'bignumber.js';
import SessionCard from './SessionCard';
import EventBus from '@/utils/eventBus';

export default {
  name: "SessionComponent",
  data: () => ({
    loadInterval: null,
    balance: '0.000',
    isShow: false,
  }),
  components: {
    SessionCard
  },
  computed: {
    aaAddress() {
      return this.$store.state.aaAddress;
    },
  },
  watch: {
    aaAddress(newVal) {
      if (!newVal) {
        this.isShow = false;
      }
    }
  },
  async created() {
    this.initData();
    EventBus.$on('show', value => {
      this.isShow = value;
    });
  },
  methods: {
    parseFixed(value) {
      if (isNaN(value)) {
        value = 0;
      } else {
        value = value.toString();
      }
      return new BigNumber(value).toFixed(3, BigNumber.ROUND_DOWN);
    },
    initData() {
      if (this.loadInterval) {
        clearInterval(this.loadInterval);
      }
      setTimeout(this.loopQueryBalance, 2000);
      this.loadInterval = setInterval(this.loopQueryBalance, 30000,);
    },
    async loopQueryBalance() {
      if (this.aaAddress) {
        const balance = await queryBalance(this.aaAddress);
        this.balance = this.parseFixed(balance);
      }
    },

    openDialog() {
      this.isShow = true;
    }
  },
};
</script>

<style scoped>
#session {
  display: flex;
  justify-content: center;
}

.wallet {
  position: relative;
  height: 38px;
  border-radius: 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 8px 4px 4px;
  background: #FFFFFF;
  background-clip: padding-box; /*important*/
  border: 1px solid transparent;
  cursor: pointer;
}
.wallet::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: -1;
  margin: -1px;
  border-radius: inherit; /*important*/
  background: linear-gradient(to right, #8F41E9, #578AEF);
}

.wallet-img {
  width: 24px;
  height: 20px;
  background-image: url("../assets/ethereum.svg");
  background-repeat:no-repeat;
  background-size:100% 100%;
  -moz-background-size:100% 100%;
}
.balance {
  font-size: 14px;
  line-height: 30px;
  text-align: center;
  margin-left: 4px;
}


.no-show {
  display: none;
}
</style>
