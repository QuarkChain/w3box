<template>
  <div>
    <w3q-tip v-if="!isMobile" style="width: 100vw" bgColor="#FF7528" fontColor="#ffffff" fontSize="15px"/>
    <w3q-tip v-else style="width: 100vw" bgColor="#FF7528" fontColor="#ffffff" fontSize="12px"/>

    <div id="app">
      <el-container>
        <el-header class="header">
          <Header/>
        </el-header>

        <el-main :style="'min-height:'+ (fullHeight-195) +'px;'">
          <router-view :key="$route.fullPath" />
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script>
import Header from "@/components/Header";
import Layout from "@/utils/Layout";

export default {
  name: 'App',
  components: {
    Header
  },
  data() {
    return {
      fullHeight: document.documentElement.clientHeight
    }
  },
  computed:{
    isMobile() {
      return Layout.isMobile();
    },
  },
  watch: {
    fullHeight(val) {
      if (!this.timer) {
        this.fullHeight = val;
        this.timer = true;
        let that = this;
        setTimeout(function () {
          that.timer = false;
        }, 400)
      }

    }
  },
  mounted() {
    this.get_bodyHeight()
  },
  methods: {
    get_bodyHeight() {
      const that = this
      window.onresize = () => {
        return (() => {
          window.fullHeight = document.documentElement.clientHeight;
          that.fullHeight = window.fullHeight;
        })()
      }
    }
  }
}
</script>

<style>
#app {
  max-width: 1200px;
  text-align: center;
  font-family: Avenir, Helvetica, Arial, AlibabaPuHuiTiM, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0 auto;
}

.header {
  height: 64px !important;
  padding: 5px 20px !important;
}
</style>
