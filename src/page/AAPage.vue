<template>
  <div>
    <div v-if="!this.result" class="domain-loading" v-loading="true"/>
    <div v-else>
      <el-card class="profile-card">
        <div class="profile-title">
          AA Wallet: <span class="profile-title-msg">{{ this.aaAccount }}</span>
          <span class="go-upload-list-item-delete" @click="onCopy">
            <update-icon name="copy"></update-icon>
          </span>
        </div>
        <div class="divider"/>

        <div class="profile-date">
          <input class="input-left"
                 type="text"
                 placeholder="0.00"
                 @input="didInputStakeAmount"
                 v-model="inputStakeAmount"/>
          <el-button round class="profile-btn" @click="onTransfer">
            Transfer Gas
          </el-button>
        </div>

        <div v-if="!this.isCreateAA">
          <div class="create-aa-title">
            Notify: Before creating an AA wallet, you need to transfer ETH to the AA wallet address as the gas.
          </div>
          <div class="profile-date" >
            <div style="font-weight: bold">
              Balance: <span style="font-weight: normal">{{ balance }} ETH</span>
            </div>
            <el-button round class="profile-btn" @click="onCreateWallet">
              Create Wallet
            </el-button>
          </div>
        </div>
      </el-card>

      <el-card class="profile-card">
        <div class="profile-title">
          Session Key
        </div>
        <div class="divider"/>

        <!--   empty   -->
        <div v-if="this.result === 'empty'" class="profile-empty">
          <div class="profile-text">
            You haven't any session key yet
          </div>
          <el-button type="warning" round class="profile-btn profile-btn-margin" @click="createSession">Create
          </el-button>
        </div>

        <!--   data   -->
        <div v-else class="profile-date">
          <div>
            Address: {{ this.result.address }}
          </div>
          <div>
            Expire date: {{ renderTimestamp(this.result.time) }}
          </div>
          <el-button type="warning" round class="update-btn" @click="createSession">Update</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  isCreated,
  createAAAccount,
  createSessionAccount,
  getAASinger,
  getSessionKey,
  transferGas
} from "@/utils/zerodev";
import {mapActions} from "vuex";
import UpdateIcon from "../components/icon";

const copy = require('clipboard-copy')
const BigNumber = require('bignumber.js');

export default {
  name: 'AAPage',
  data: () => {
    return {
      result: undefined,
      aaAccount: null,
      aaSinger: null,

      inputStakeAmount: 0,
      stakeAmount: new BigNumber(0),
      balance: 0,
    };
  },
  components: { UpdateIcon },
  computed: {
    account() {
      return this.$store.state.account;
    },
    contract() {
      if (this.$store.state.chainConfig && this.$store.state.chainConfig.chainID) {
        const {FileBoxController} = this.$store.state.chainConfig;
        return FileBoxController;
      }
      return null;
    },
    isActiveSession() {
      return this.sessionKey && this.sessionKey.time > new Date().getTime();
    },
    isExpiredSession() {
      return this.sessionKey && this.sessionKey.time < new Date().getTime();
    }
  },
  watch: {
    account: function () {
      if (!this.account) {
        this.goHome();
      } else {
        this.onQuery();
      }
    }
  },
  asyncComputed: {
    async isCreateAA() {
      if(this.aaAccount) {
        return await isCreated(this.aaAccount);
      }
      return false;
    }
  },
  created() {
    this.onQuery();
  },
  methods: {
    ...mapActions(["setAAAccount", "setSessionKey"]),
    renderTimestamp(ts) {
      if (!ts) {
        return "";
      }
      return new Date(ts)
          .toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
    },
    async onQuery() {
      if (!this.contract || !this.account) {
        return;
      }
      this.aaSinger = await getAASinger();
      this.aaAccount = await this.aaSinger.getAddress();
      this.setAAAccount(this.aaAccount);
      const sessionKey = getSessionKey(this.account);
      this.result = sessionKey ? sessionKey : 'empty';
    },
    onCopy(){
      console.log(this.aaAccount)
      copy(this.aaAccount);
      this.$notify({
        title: 'Success',
        message: 'Copy Success',
        type: 'success'
      });
    },
    goHome() {
      this.$router.push({path: "/"});
    },
    async didInputStakeAmount() {
      const value = this.predicateValue(this.inputStakeAmount);
      if (value !== this.inputStakeAmount) {
        this.inputStakeAmount = value;
      }
      this.stakeAmount = new BigNumber(value);
    },
    predicateValue(value, fixed = 18) {
      if (value == null) {
        return null;
      }
      value = value.replace(/[^\d.]/g, ''); //清除"数字"和"."以外的字符
      value = value.replace(/\.{2,}/g, '.'); //只保留第一个. 清除多余的
      value = value.replace(/^0+\./g, '0.');
      value = value.match(/^0+[1-9]+/)
          ? (value = value.replace(/^0+/g, ''))
          : value;
      let reg = new RegExp(`^\\d*(\\.?\\d{0,${fixed}})`, 'g');
      value = value.match(reg)[0] || '';
      if (value == '.') {
        value = '0.';
      }
      return value;
    },
    async onTransfer() {
      if (!this.stakeAmount.isZero()) {
        let receiverAddress = this.aaAccount;
        let amountInEther = this.stakeAmount;
        const result = await transferGas(receiverAddress, amountInEther);
        if (result) {
          this.$notify({
            title: 'Success',
            message: 'Transfer Gas Success',
            type: 'success'
          });
          this.goAA();
        } else {
          this.$notify({
            title: 'Error',
            message: 'Transfer Gas Fail',
            type: 'error'
          });
        }
      }
    },
    async onCreateWallet() {
      const result = await createAAAccount();
      if (result) {
        this.$notify({
          title: 'Success',
          message: 'Create Wallet Success',
          type: 'success'
        });
        this.goAA();
      } else {
        this.$notify({
          title: 'Error',
          message: 'Create Wallet Fail',
          type: 'error'
        });
      }
    },
    async createSession() {
      createSessionAccount(this.aaSinger, this.contract, this.account)
          .then((item) => {
            this.result = item;
            this.setSessionKey(item);
            this.$notify({
              title: 'Success',
              message: 'Create Success',
              type: 'success'
            });
          })
          .catch((e) => {
            console.log(e);
            this.$notify({
              title: 'Error',
              message: 'Create Fail',
              type: 'error'
            });
          });
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../assets/styles/mixins.scss";
@import "../assets/styles/vars.scss";

.domain-loading {
  min-width: 40vw;
  min-height: 60vh;
}
.domain-loading >>> .el-loading-mask{
  background: transparent !important;
}

.profile-card {
  background: #FFFFFF;
  border-radius: 16px;
  margin-top: 35px;
  padding: 15px;
}

.profile-title {
  font-size: 20px;
  color: #000000;
  text-align: left;
  font-weight: bold;
}
.profile-title-msg {
  color: #221F33;
  font-weight: normal;
  font-size: 17px;
}

.divider {
  background-color: #E8E6F2;
  height: 1px;
  padding: 0;
  width: 100%;
  margin: 20px 0;
}

.profile-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 240px;
}
.profile-text {
  font-size: 18px;
  color: #221F33;
}

.profile-btn {
  color: white;
  background-color: #52DEFF;
  font-size: 18px;
  border: 0;
}
.profile-btn:focus,
.profile-btn:hover {
  color: white;
  background-color: #52DEFFBB;
}
.profile-btn-margin {
  margin-top: 25px;
}

.profile-date {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 35px;
  width: 100%;
  font-size: 16px;
}

.update-btn {
  color: white;
  background-color: #52DEFF;
  font-size: 14px;
  border: 0;
}
.update-btn:focus,
.update-btn:hover {
  color: white;
  background-color: #52DEFFBB;
}

.go-upload-list-item-delete {
  font-size: 20px;
  width: 30px;
  height: 30px;
  margin-left: 20px;
  color: #52DEFFBB;
  cursor: pointer;
}
.input-left {
  padding: 10px 13px;
  box-sizing: border-box;
  font-size: 15px;
  outline: none;
  border: 1px solid #52DEFFBB;
  width: 250px;
  height: 44px;
  border-radius: 30px;
  color: #212121;
  background: inherit;
}
.create-aa-title {
  margin-top: 35px;
  margin-bottom: -5px;
  color: red;
}

@media screen and (max-width: 500px) {
  .profile-card {
    padding: 0;
    margin-top: 5px;
  }

  .profile-date {
    justify-content: center;
  }

  .divider {
    width: 100%;
    margin: 15px 0;
  }

  .profile-empty {
    height: 80%;
  }

  .profile-btn {
    font-size: 14px;
  }
}
</style>
