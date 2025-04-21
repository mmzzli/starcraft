import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import walletUtils from "@/globalUtil/walletUtils";
import { TeamDaoFactory } from "@/utils/pool/TeamDao";
export default createStore({
  state: {
    walletAccount: "",
    inviteCode: "",
    isShowRichPlanDialog: true,
    teamDao: {
      teamId: "",
      limitRewardSCT: 0, // 股份余额     上限
      staked: 0, // 质押保证金,
      effect: false, // 是否有团队
      withdrawedRewardSCT: 0, // 已提现红利
      unlockedRewardSCT: 0, // 已提现+待提现之和
      isNewTeamLeader: true, // 是否是新团队长
      stakeAmount: 0
    }
  },
  getters: {},
  mutations: {
    setWalletAccount(state, data) {
      state.walletAccount = data;
    },
    setInviteCode(state, data) {
      state.inviteCode = data;
    },
    setBalance(state, { tokenKey, balance }) {
      state[`balance${tokenKey}`] = balance;
    },
    setIsShowRichPlanDialog(state, data) {
      state.isShowRichPlanDialog = data;
    },
    setTeamDao(state, data) {
      state.teamDao = data;
    }
  },
  actions: {
    async getBalance({ commit }, tokenData) {
      const tokenKey = Object.keys(tokenData)[0];
      const tokenValue = tokenData[tokenKey];
      try {
        const balance = await walletUtils.getBalance(tokenValue);
        commit("setBalance", { tokenKey, balance });
      } catch (err) {
        console.error(err);
        commit("setBalance", { tokenKey, balance: 0 });
      }
    },
    async getTeamDao({ commit, state }) {
      try {
        const teamDaoFactory = new TeamDaoFactory();
        const teamDao = await teamDaoFactory.teamLeaderInfo(
          state.walletAccount
        );
        console.log(teamDao, "teamDao======");
        const stakeAmount = await teamDaoFactory.getStakeAmount();
        console.log(stakeAmount.toString(), "stakeAmount");
        commit("setTeamDao", {
          teamId: teamDao.leaderId?.toString(),
          limitRewardSCT: teamDao.limitRewardSCT.toString(),
          staked: teamDao.staked.toString(),
          withdrawedRewardSCT: teamDao.withdrawedRewardSCT.toString(),
          unlockedRewardSCT: teamDao.unlockedRewardSCT.toString(),
          effect: teamDao.effect,
          isNewTeamLeader: !(!!teamDao.teamId && teamDao.effect == false),
          stakeAmount: stakeAmount.toString()
        });
      } catch (err) {
        console.error(err, "error==========================");
        commit("setTeamDao", {
          teamId: "",
          limitRewardSCT: 0, // 股份余额     上限
          staked: 0, // 质押保证金,
          withdrawedRewardSCT: 0, // 已提现红利
          unlockedRewardSCT: 0, // 已提现+待提现
          effect: false,
          isNewTeamLeader: true,
          stakeAmount: 0
        });
      }
    }
  },
  plugins: [
    createPersistedState({
      storage: window.localStorage,
      reducer(val: any) {
        return {
          walletAccount: val.walletAccount,
          inviteCode: val.inviteCode
        };
      }
    })
  ]
});
