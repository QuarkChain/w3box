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
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { chains } from '@/store/state';
import {createSession, createWallet, signSeed} from "@/utils/Session";

export class UnsupportedChainIdError extends Error {
  constructor() {
    super('UnsupportedChainIdError: not support chain')
  }
}

const chain = 3151908;
const chainID = `0x${chain.toString(16)}`;
const nodes = ['https://65.109.50.145:32773']
const explorers = [`https://goerli-rollup-explorer.arbitrum.io/`];

export default {
  name: "WalletComponent",
  props: {},

  data: () => ({
    networkId: chain,
    currentAccount: null,
  }),
  async created() {
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
    ...mapActions(["setChainConfig", "setAccount", "setAAAccount", "setSessionKey"]),
    connectWallet() {
      if (!window.ethereum) {
        this.$message.error('Can\'t setup the Web3Q network on metamask because window.ethereum is undefined');
        return;
      }
      this.login();
    },
    async handleChainChanged() {
      const newChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainID !== newChainId) {
        this.currentAccount = null;
        this.setAccount(null);
        this.setAAAccount(null);
        this.setSessionKey(null);
        this.setChainConfig({});
      } else {
        const c = chains.find((v) => v.chainID === chainID);
        this.setChainConfig(JSON.parse(JSON.stringify(c)));
        if (!this.currentAccount) {
          await this.login();
        }
      }
    },
    async handleAccountsChanged(accounts) {
      // chain
      const newChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainID !== newChainId) {
        //  not support chain
        this.setChainConfig({});
      } else {
        const c = chains.find((v) => v.chainID === chainID);
        this.setChainConfig(JSON.parse(JSON.stringify(c)));
      }

      // account
      if (accounts.length === 0) {
        this.currentAccount = null;
        this.setAccount(null);
        this.setAAAccount(null);
        this.setSessionKey(null);
        console.warn(
          "MetaMask is locked or the user has not connected any accounts"
        );
        return;
      }
      if (chainID !== newChainId) {
        this.currentAccount = null;
        this.setAccount(null);
        this.setAAAccount(null);
        this.setSessionKey(null);
        throw new UnsupportedChainIdError();
      }

      if (accounts[0] !== this.currentAccount) {
        this.currentAccount = accounts[0];
        this.setAccount(accounts[0]);
        this.initAAInfo().then();
      }
    },
    async login() {
      window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then(this.handleAccountsChanged)
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
                chainName: 'Arbitrum Goerli',
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
    goProfile(){
      this.$router.push({path: "/address/" + this.currentAccount});
    },
    goAA() {
      this.$router.push({path: "/aa"});
    },
    async initAAInfo() {
      // TODO
      const sign = await signSeed(this.currentAccount);
      const key = await createSession('', sign, '12345');
      const wallet = createWallet(key);
      console.log(wallet.address)
    }
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
</style>
