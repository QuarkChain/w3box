<template>
  <div>
    <div v-if="!this.result" class="domain-loading" v-loading="true"/>
    <el-card v-else class="profile-card">
      <div class="profile-title">
        Files
      </div>
      <div class="divider"/>

      <!--   empty   -->
      <div v-if="!this.result || this.result.length<=0" class="profile-empty">
        <div class="profile-text">
          You don't own any file yet
        </div>
        <el-button type="warning" round class="profile-btn" @click="goHome">Upload your first file</el-button>
      </div>

      <!--   data   -->
      <div v-else class="profile-date">
        <div class="list-item" v-for="(item) in this.result" :key="item.url">
          <div style="display:flex; flex-direction: row; align-items: center">
            <img class="go-upload-list-item-img" :src="item.url" alt="">
            <div class="go-upload-list-item-name">
              <span>{{ renderName(item.name) }}</span>
            </div>
          </div>

          <span>{{ renderTimestamp(item.time)}}</span>

          <div>
             <span class="go-upload-list-item-delete" @click="onCopy(item.url)">
              <update-icon name="copy"></update-icon>
            </span>
            <span class="go-upload-list-item-delete" @click="onDelete(item)">
              <update-icon name="close"></update-icon>
            </span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import {ethers} from "ethers";
import UpdateIcon from "./icon";
import {getUploadByAddress, deleteFile} from '@/utils/profile';

const copy = require('clipboard-copy')
const hexToString = (h) => ethers.utils.toUtf8String(h);

export default {
  name: 'Profile',
  data: () => {
    return {
      name: "",
      result: null,
    };
  },
  components: { UpdateIcon },
  computed: {
    chainConfig() {
      return this.$store.state.chainConfig;
    },
  },
  watch: {
    chainConfig: function () {
      if (this.$store.state.chainConfig && this.$store.state.chainConfig.chainID) {
        this.onSearch();
      }
    }
  },
  created() {
    this.onSearch();
  },
  methods: {
    renderTimestamp(ts) {
      if (!ts) {
        return "";
      }
      return ts.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
    renderName(name) {
      return hexToString(name);
    },
    goHome() {
      this.$router.push({path: "/"});
    },
    onSearch() {
      const { FileBoxController} = this.$store.state.chainConfig;
      if (!FileBoxController) {
        return;
      }
      getUploadByAddress(FileBoxController, this.$route.params.address)
          .then(value => {
            this.result = value;
          })
          .catch(() => {
            this.result = [];
          });
    },
    onCopy(url){
      copy(url);
      this.$notify({
        title: 'Success',
        message: 'Copy Success',
        type: 'success'
      });
    },
    onDelete(item) {
      const { FileBoxController} = this.$store.state.chainConfig;
      if (!FileBoxController) {
        return;
      }
      deleteFile(FileBoxController, item.name)
          .then((v) => {
            if (v) {
              this.result = this.result.filter(value => item !== value);
              this.$notify({
                title: 'Success',
                message: 'Delete Success',
                type: 'success'
              });
            } else {
              this.$notify({
                title: 'Error',
                message: 'Delete Fail',
                type: 'error'
              });
            }
          })
          .catch(() => {
            this.$notify({
              title: 'Error',
              message: 'Delete Fail',
              type: 'error'
            });
          });
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
  min-height: 50vh;
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
  color: #221F33;
  text-align: left;
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
  background-color: #FF7528;
  margin-top: 15px;
  font-size: 18px;
  border: 0;
}
.profile-btn:focus,
.profile-btn:hover {
  background-color: #FF7528BB;
}

.profile-date {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.list-item {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  padding: 15px;
  border: 1px solid rgba(35,46,63,.4);
}
.go-upload-list-item-img {
  width: 90px;
  height: 90px;
}
.go-upload-list-item-name{
  font-size: 19px;
  font-weight: bold;
  margin-left: 25px;
}
.go-upload-list-item-delete {
  font-size: 20px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  padding: 15px;
}

@media screen and (max-width: 420px) {
  .profile-card {
    padding: 0;
    margin-top: 5px;
  }

  .profile-date {
    justify-content: center;
  }
}
</style>
