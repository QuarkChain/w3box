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
          You don't own any domains yet
        </div>
        <el-button type="warning" round class="profile-btn" @click="goHome">Upload your first file</el-button>
      </div>

      <!--   data   -->
      <div v-else class="profile-date">
        <div class="list-item" v-for="(file) in this.result" :key="file">
          <img class="go-upload-list-item-img" :src="file" alt="">

          <div class="go-upload-list-item-name">
            <span>{{ getFileName(file) }}</span>
          </div>

          <div>
             <span class="go-upload-list-item-delete" @click="onCopy(file)">
              <update-icon name="copy"></update-icon>
            </span>
            <span v-if="false" class="go-upload-list-item-delete" @click="onDelete(file)">
              <update-icon name="close"></update-icon>
            </span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import UpdateIcon from "./icon";
import {getUploadByAddress, deleteFile} from '@/utils/profile';
const copy = require('clipboard-copy')

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
          .catch((e) => {
            console.log(e)
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
    onDelete(url) {
      const { FileBoxController} = this.$store.state.chainConfig;
      if (!FileBoxController) {
        return;
      }
      deleteFile(FileBoxController, this.getFileName(url))
          .then(() => {
            this.result.remove(url);
          })
          .catch((e) => {
            console.log(e)
          });
    },
    getFileName(url) {
      if(url) {
        const names = url.split("/");
        return names[names.length - 1];
      }
      return "";
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
