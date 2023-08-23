<template>
  <div id="wallet">
    <button
      class="btn-connect"
      v-if="!this.currentAccount"
      @click.stop="connectWallet"
    >
      Connect
    </button>
    <div v-else class="user">
      <div class="metamask">
        <div class="metamask-img" />
        <div class="account">{{ this.accountShort }}</div>
      </div>
      <div class="favorite" @click.stop="goProfile"/>
    </div>

    <el-dialog :visible="this.showRegister"
               :show-close="false"
               :lock-scroll="false"
               :append-to-body="true"
               class="dialog_card" >
      <div class="card-item">
        <p class="item-title">Register Session Key</p>
        <p class="item-message">
          To enable transactions of the EIP-4844 type, it is required to create a SessionKey wallet, which <br/>
          will serve as the payment wallet and perform background file uploads.
        </p>
        <el-input class="item-input" placeholder="Input Password" v-model="input" show-password />
        <div class="dialog_btn_layout">
          <el-button round class="dialog_btn" @click="onClose">Cancel</el-button>
          <el-button type="warning" round class="records-btn" @click="onRegister">
            Register
          </el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible="this.showLogin"
               :show-close="false"
               :lock-scroll="false"
               :append-to-body="true"
               class="dialog_card" >
      <div class="card-item">
        <p class="item-title">Login Session Key</p>
        <p class="item-message">
          To enable transactions of the EIP-4844 type, it is required to create a SessionKey wallet, which <br/>
          will serve as the payment wallet and perform background file uploads.
        </p>
        <el-input class="item-input" placeholder="Input Password" v-model="input" show-password />
        <div class="dialog_btn_layout">
          <el-button round class="dialog_btn" @click="onClose">Cancel</el-button>
          <el-button type="warning" round class="records-btn" @click="onLogin">
            Login
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { chains } from '@/store/state';
import {
  createSession,
  createWallet,
  encryptSession,
  getSessionKey,
  querySessionKey,
  saveSessionKey,
  signSeed
} from "@/utils/Session";

export class UnsupportedChainIdError extends Error {
  constructor() {
    super('UnsupportedChainIdError: not support chain')
  }
}

const chain = 7011893058;
const chainID = `0x${chain.toString(16)}`;
const nodes = ['https://rpc.dencun-devnet-8.ethpandaops.io']
const explorers = ['https://explorer.dencun-devnet-8.ethpandaops.io'];

export default {
  name: "WalletComponent",
  props: {},

  data: () => ({
    networkId: chain,
    currentAccount: null,
    contract: null,

    showRegister: false,
    showLogin: false,
    signature: '',
    sessionResult: null,

    input: '',
  }),
  async created() {
    const c = chains.find((v) => v.chainID === chainID);
    const config = JSON.parse(JSON.stringify(c));
    this.setChainConfig(config);
    this.contract = config.FileBoxController;

    this.connectWallet();
    window.ethereum.on("chainChanged", this.handleChainChanged);
    window.ethereum.on("accountsChanged", this.handleAccountsChanged);
  },
  computed: {
    accountShort() {
      return (
        this.currentAccount.substring(0, 6) +
        "..." +
        this.currentAccount.substring(
          this.currentAccount.length - 4,
          this.currentAccount.length
        )
      );
    },
  },
  methods: {
    ...mapActions(["setChainConfig", "setAccount", "setSessionKey", "setSessionAddr"]),
    goProfile(){
      this.$router.push({path: "/address/" + this.currentAccount});
    },
    connectWallet() {
      if (!window.ethereum) {
        this.$message.error('Can\'t setup the Web3Q network on metamask because window.ethereum is undefined');
        return;
      }
      this.login();
    },
    onClose() {
      this.showRegister = false;
    },
    async onRegister() {
      const password = this.input;
      if (!password) {
        this.$message.error('Invalid password');
        return;
      }

      const result = await createSession(this.contract, this.signature, password);
      if (result) {
        this.setSessionKey(result.sessionKey);
        this.setSessionAddr(result.address);
        saveSessionKey(this.currentAccount, result.sessionKey);

        this.showRegister = false;
        this.$notify({
          title: 'Success',
          message: 'Register Success',
          type: 'success'
        });
      } else {
        this.$message.error('Register Fail!');
      }
    },
    async onLogin() {
      const password = this.input;
      if (!password) {
        this.$message.error('Invalid password');
        return;
      }

      const sessionKey = await encryptSession(this.signature, password, this.sessionResult.iv, this.sessionResult.encrypt);
      if (sessionKey) {
        this.setSessionKey(sessionKey);
        this.setSessionAddr(this.sessionResult.address);
        saveSessionKey(this.currentAccount, sessionKey);

        this.showLogin = false;
        this.$notify({
          title: 'Success',
          message: 'Login Success',
          type: 'success'
        });
      } else {
        this.$message.error('Password Error');
      }
    },
    async handleChainChanged() {
      const newChainId = await window.ethereum.request({method: "eth_chainId"});
      if (chainID !== newChainId) {
        this.setSessionKey(null);
      } else {
        if (this.currentAccount) {
          const sessionKey = getSessionKey(this.currentAccount);
          this.setSessionKey(sessionKey??null);
        }
      }
    },
    async handleAccountsChanged(accounts) {
      if (accounts[0] !== this.currentAccount) {
        this.setSessionKey(null);
      } else {
        const sessionKey = getSessionKey(this.currentAccount);
        this.setSessionKey(sessionKey??null);
      }
    },
    async handleAccounts(accounts) {
      if (accounts.length === 0) {
        this.currentAccount = null;
        this.setAccount(null);
        this.setSessionKey(null);
        this.setSessionAddr(null);
        console.warn(
            "MetaMask is locked or the user has not connected any accounts"
        );
        return;
      }

      const newChainId = await window.ethereum.request({method: "eth_chainId"});
      if (chainID !== newChainId) {
        throw new UnsupportedChainIdError();
      }

      this.currentAccount = accounts[0];
      this.setAccount(accounts[0]);
      await this.initSessionInfo();
    },
    async login() {
      window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then(this.handleAccounts)
          .catch(async (error) => {
            if (error.code === 4001) {
              this.$message.error('User rejected');
            } else if (error instanceof UnsupportedChainIdError) {
              const hasSetup = await this.setupNetwork();
              if (hasSetup) {
                await this.login();
              }
            } else {
              this.$message.error('Connect Error');
            }
          });
    },
    async setupNetwork() {
      const provider = window.ethereum;
      if (provider) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainID,
                chainName: 'Ethereum Devnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: nodes,
                blockExplorerUrls: explorers,
              },
            ],
          })
          const newChainId = await window.ethereum.request({method: "eth_chainId"});
          if (chainID !== newChainId) {
            this.$message.error('User rejected');
            return false;
          }
          return true;
        } catch (error) {
          this.$message.error('Failed to setup the network in Metamask');
          return false
        }
      } else {
        this.$message.error('Can\'t setup the Web3Q network on metamask because window.ethereum is undefined');
        return false
      }
    },
    async initSessionInfo() {
      const sessionKey = getSessionKey(this.currentAccount);
      if(sessionKey) {
        // login success
        this.setSessionKey(sessionKey);
        const wallet = createWallet(sessionKey);
        this.setSessionAddr(wallet.address);
      } else {
        const sign = await signSeed(this.currentAccount, chain);
        if (!sign) {
          this.$message.error('User rejected sign');
          return;
        }

        this.signature = sign;
        const sessionResult = await querySessionKey(this.contract);
        if (sessionResult) {
          // is register, show login ui
          this.sessionResult = sessionResult;
          this.showLogin = true;
        } else {
          // not register, show sign ui
          this.showRegister = true;
        }
      }
    },
  },
};
</script>

<style scoped>
#wallet {
  display: flex;
  justify-content: center;
}

.user{
  display: flex;
  flex-direction: row;
}

.metamask {
  height: 38px;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 4px 4px 8px;
  background: #FFFFFF;
  border: 1px solid #E8E6F2;
}
.metamask-img {
  width: 24px;
  height: 24px;
  background-image: url("../assets/metamask.svg");
  background-repeat:no-repeat;
  background-size:100% 100%;
  -moz-background-size:100% 100%;
}
.account {
  font-size: 14px;
  line-height: 30px;
  background: #ECF0F9;
  border-radius: 12px;
  border: none;
  padding: 0 8px;
  text-align: center;
  margin-left: 10px;
}

.favorite{
  cursor: pointer;
  height: 38px;
  width: 38px;
  margin-left: 15px;
  padding: 0;
  background-image: url("../assets/user.png");
  background-repeat:no-repeat;
  background-size:100% 100%;
  -moz-background-size:100% 100%;
}

.btn-connect {
  transition: all 0.1s ease 0s;
  width: 120px;
  height: 44px;
  color: #ffffff;
  font-size: 18px;
  border: 0;
  background: #52DEFF;
  border-radius: 36px;
  cursor: pointer;
}
.btn-connect:hover {
  background-color: #52DEFF90;
  border: 0;
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
