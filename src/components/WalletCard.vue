<template>
  <el-card class="dialog_card">
    <div class="dialog_item">
      <p class="item-title">Deploy AA Account</p>
      <i class="el-icon-close item-close" @click="$parent.close()"/>
    </div>

    <div class="dialog-msg">
      W3Box uses AA account for file upload, an ERC-4337 compatible smart contract account fully controlled by your current connected address.
    </div>

    <div v-if="!this.created">
      <el-card class="wallet-card">
        <div class="gas-title">1. Top up Gas Credit</div>
        <div class="wallet-top-item gas-layout">
          <el-input class="item-input" placeholder=">= 0.01 ETH" @input="didInputStakeAmount" v-model="input"/>
          <el-button type="warning" round class="records-btn"
                     :loading='gasLoading' @click="onTransfer">
            Transfer
          </el-button>
        </div>
      </el-card>
      <el-card class="wallet-card">
        <div class="gas-title">2. Deploy AA Account</div>
        <el-button type="warning" round class="records-btn create-aa"
                   :disabled="isDisabledCreate"
                   :loading='createLoading' @click="onDeploy">
          Deploy
        </el-button>
      </el-card>
    </div>
    <el-card v-else class="wallet-card">
      <div class="deploy-success-layout">
        <i class="el-icon-success deploy-icon"/>
        <span class="deploy-title">Deploy Success</span>
      </div>
    </el-card>
  </el-card>
</template>

<script>
import BigNumber from 'bignumber.js';
import {mapActions} from "vuex";
import {transferGas, queryBalance, isCreate, getAddress, createAA} from "@/utils/Particle";

const Max_Gas = 0.01;

export default {
  name: "WalletCardComponent",
  props: ['canCancel'],
  data: () => ({
    aaAddress: '',
    created: false,

    input: '',
    gasLoading: false,

    isDisabledCreate: true,
    createLoading: false,
  }),
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
  },
  created() {
    this.initData();
  },
  methods: {
    ...mapActions(["setAAAddress"]),
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
    didInputStakeAmount() {
      const value = this.predicateValue(this.input);
      if (value !== this.input) {
        this.input = value;
      }
    },
    async onTransfer() {
      const amount = this.input;
      if (!amount) {
        this.$message.error('Invalid amount');
        return;
      }

      if (new BigNumber(amount).lt(Max_Gas)) {
        this.$message.error(`Gas cannot be less than ${Max_Gas} ETH`);
        return;
      }

      this.gasLoading = true;
      const result = await transferGas(amount, this.aaAddress);
      if (result) {
        this.gasLoading = false;
        this.isDisabledCreate = false;
        this.$notify({
          title: 'Success',
          message: 'Transfer Success',
          type: 'success'
        });
      } else {
        this.$message.error('Transfer Fail!');
      }
    },
    async onDeploy() {
      this.createLoading = true;
      const status = await createAA(this.contract, this.aaAddress, this.account);
      this.createLoading = false;
      if (status) {
        this.$notify({
          title: 'Success',
          message: 'Deploy AA Account Success',
          type: 'success'
        });
        this.setAAAddress(this.aaAddress);
        this.$parent.close();
      } else {
        this.$message.error('Deploy Fail!');
      }
    },
    async initData() {
      if (this.$store.state.aaAddress) {
        this.created = true;
      } else {
        this.aaAddress = await getAddress();
        const [created, balance] = await Promise.all([
          isCreate(this.contract, this.account),
          queryBalance(this.aaAddress)
        ]);
        this.created = created;
        if (new BigNumber(balance).gte(Max_Gas)) {
          this.isDisabledCreate = false;
        }
      }
    }
  },
};
</script>

<style scoped>
.dialog_card {
  position: relative;
  border-radius: 16px;
  width: 450px;
}

.dialog_item{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.item-title {
  font-size: 20px;
  color: #000000;
  line-height: 20px;
  font-weight: bold;
}
.item-close {
  font-size: 22px;
  cursor: pointer;
}
.dialog-msg {
  margin-top: 35px;
  text-align: left;
  font-size: 16px;
  color: #222222;
  line-height: 20px;
}


.wallet-card {
  margin-top: 30px;
  border-radius: 16px;
}
.gas-title {
  font-size: 17px;
  color: #222222;
  text-align: left;
}
.wallet-top-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 15px 0;
  justify-content: space-between;
}
.item-input {
  width: 60%;
}
.records-btn {
  background: #52DEFF;
  border: 1px solid #52DEFF;
  font-size: 17px;
  width: 120px;
}
.records-btn:focus,
.records-btn:hover {
  background: #52DEFFA0;
  border: 1px solid #52DEFFA0;
}
.records-btn:disabled,
.records-btn:disabled:hover {
  background: rgba(104, 141, 150, 0.31);
  border: 0;
}

.create-aa {
  margin: 25px 0 15px;
}

.deploy-success-layout {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.deploy-icon {
  font-size: 60px;
  color: #52DEFF;
  margin: 30px 15px;
}
.deploy-title {
  font-size: 25px;
  color: #52DEFF;
}
</style>
