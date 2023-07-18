import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    chainConfig: {},
    account: '',
    aaAccount: '',
    sessionKey: '',
  },
  mutations: {
    chainMutation: (state, payload) => state.chainConfig = payload,
    accountMutation:  (state, payload) => state.account = payload,
    aaAccountMutation:  (state, payload) => state.aaAccount = payload,
    sessionKeyMutation:  (state, payload) => state.sessionKey = payload,
  },
  actions: {
    setChainConfig: ({ commit }, payload) => commit('chainMutation', payload),
    setAccount: ({ commit }, payload) => commit('accountMutation', payload),
    setAAAccount: ({ commit }, payload) => commit('aaAccountMutation', payload),
    setSessionKey: ({ commit }, payload) => commit('sessionKeyMutation', payload),
  },
  modules: {
  },
});
