<template>
  <div id="session">
    <div v-if="this.sessionKey" class="wallet" @click="openDialog">
      <div class="wallet-img"/>
      <p class="balance">{{ this.balance }} ETH</p>
    </div>
    <div v-else class="no-show" />

    <el-dialog :visible.sync="this.showDialog"
               :lock-scroll="false"
               :append-to-body="true"
               class="dialog_card">
      <div class="card-item">
        <p class="item-title">Account</p>

        <el-input class="item-input" placeholder="Input Password" v-model="input" show-password/>
        <div class="dialog_btn_layout">
          <el-button round class="dialog_btn" @click="onClose">Cancel</el-button>
          <el-button type="warning" round class="records-btn" @click="onRegister">
            Register
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {queryBalance} from "@/utils/Session";
import BigNumber from 'bignumber.js';

export default {
  name: "SessionComponent",
  data: () => ({
    loadInterval: null,
    balance: '0.000',

    showDialog: false,
    input: '',
  }),
  computed: {
    sessionKey() {
      return this.$store.state.sessionKey;
    },
    sessionAddress() {
      return this.$store.state.sessionAddr;
    },
  },
  async created() {
    this.initData();
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
      this.loopQueryBalance();
      this.loadInterval = setInterval(this.loopQueryBalance, 15000,);
    },
    async loopQueryBalance() {
      if (this.sessionAddress) {
        const balance = await queryBalance(this.sessionAddress);
        this.balance = this.parseFixed(balance);
      }
    },

    openDialog() {
      this.showDialog = true;
    },
    onClose() {
      this.showDialog = false;
    },
    async onRegister() {
      const password = this.input;
      if (!password) {
        this.$message.error('Invalid password');
        return;
      }

      // const result = await createSession(this.contract, this.signature, password);
      // if (result) {
      //   this.setSessionKey(result.sessionKey);
      //   this.setSessionAddr(result.address);
      //   saveSessionKey(this.currentAccount, result.sessionKey);
      //
      //   this.showRegister = false;
      //   this.$notify({
      //     title: 'Success',
      //     message: 'Register Success',
      //     type: 'success'
      //   });
      // } else {
      //   this.$message.error('Register Fail!');
      // }
    },
    async onLogin() {
      const password = this.input;
      if (!password) {
        this.$message.error('Invalid password');
        return;
      }

      // const sessionKey = await encryptSession(this.signature, password, this.sessionResult.iv, this.sessionResult.encrypt);
      // if (sessionKey) {
      //   this.setSessionKey(sessionKey);
      //   this.setSessionAddr(this.sessionResult.address);
      //   saveSessionKey(this.currentAccount, sessionKey);
      //
      //   this.showLogin = false;
      //   this.$notify({
      //     title: 'Success',
      //     message: 'Login Success',
      //     type: 'success'
      //   });
      // } else {
      //   this.$message.error('Password Error');
      // }
    },
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



.dialog_card {
}
.dialog_card >>> .el-dialog{
  border-radius: 16px;
}

.card-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.item-title {
  font-size: 20px;
  color: #000000;
  line-height: 20px;
  font-weight: bold;
}
.item-message {
  font-size: 15px;
  color: #333333;
  line-height: 28px;
  margin-top: 30px;
  width: 85%;
}
.item-input {
  margin-top: 30px;
  width: 50%;
}

.dialog_btn_layout {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 60px;
  margin-bottom: 10px;
}
.dialog_btn {
  border: 1px solid #52DEFF;
  background: #FFFFFF;
  font-size: 17px;
  color: #52DEFF;
  width: 110px;
  margin-right: 40px;
}
.dialog_btn:focus,
.dialog_btn:hover {
  border: 1px solid #52DEFFA0;
  color: #52DEFFA0;
  background: #FFFFFFA0;
}
.records-btn {
  background: #52DEFF;
  border: 1px solid #52DEFF;
  font-size: 17px;
  width: 110px;
}
.records-btn:focus,
.records-btn:hover {
  background: #52DEFFA0;
  border: 1px solid #52DEFFA0;
}
</style>
