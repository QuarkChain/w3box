<template>
  <div>
    <div v-if="!this.result" class="domain-loading" v-loading="true"/>
    <el-card v-else class="profile-card">
      <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center">
        <div class="profile-title">
          AA: <span class="profile-title-msg">{{ this.aaAccount }}</span>
        </div>
        <el-button round class="profile-btn" @click="onTransfer">
          Transfer Gas
        </el-button>
      </div>

      <div class="divider"/>

      <!--   empty   -->
      <div v-if="this.result === 'empty'" class="profile-empty">
        <div class="profile-text">
          You haven't any session key yet
        </div>
        <el-button type="warning" round class="profile-btn profile-btn-margin" @click="createSession">Create</el-button>
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
</template>

<script>
import {createSessionAccount, getAASinger, getSessionKey} from "@/utils/zerodev";
import {mapActions} from "vuex";

const copy = require('clipboard-copy')

export default {
  name: 'AAPage',
  data: () => {
    return {
      result: undefined,
      aaAccount: null,
      aaSinger: null,
    };
  },
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
  watch: {
    account: function () {
      if (!this.account) {
        this.goHome();
      } else {
        this.onQuery();
      }
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
    onCopy(url){
      copy(url);
      this.$notify({
        title: 'Success',
        message: 'Copy Success',
        type: 'success'
      });
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
    goHome() {
      this.$router.push({path: "/"});
    },
    onTransfer() {

    }
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
  padding: 35px 0;
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

  .list-item {
    padding: 15px 8px;
  }
  .go-upload-list-item-name {
    font-size: 10px;
    margin-left: 5px;
    width: 80px;
  }
  .go-upload-list-item-time {
    font-size: 10px;
  }
}
</style>
