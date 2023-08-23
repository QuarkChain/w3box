import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    chainConfig: {},
    account: '',
    sessionKey: '',
    sessionAddr: '',
  },
  mutations: {
    chainMutation: (state, payload) => state.chainConfig = payload,
    accountMutation:  (state, payload) => state.account = payload,
    sessionKeyMutation:  (state, payload) => state.sessionKey = payload,
    sessionAddrMutation:  (state, payload) => state.sessionAddr = payload,
  },
  actions: {
    setChainConfig: ({ commit }, payload) => commit('chainMutation', payload),
    setAccount: ({ commit }, payload) => commit('accountMutation', payload),
    setSessionKey: ({ commit }, payload) => commit('sessionKeyMutation', payload),
    setSessionAddr: ({ commit }, payload) => commit('sessionAddrMutation', payload),
  },
  modules: {
  },
});
