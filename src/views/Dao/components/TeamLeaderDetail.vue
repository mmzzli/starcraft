<template>
  <div class="partner-container">
    <div class="partner-header">
      <div class="title">Partner ID：{{ store.state.teamDao.teamId }}</div>
      <div class="info">
        Share balance：
        {{
          new BigNumber(store.state.teamDao.limitRewardSCT)
            .div(new BigNumber(10).pow(18))
            .toString()
        }}
        SCT
      </div>
    </div>

    <div class="item" style="margin-bottom: 20px">
      <div class="left">
        <i class="iconfont icon-safe"></i>My pledge margin：
      </div>
      <div class="right">
        <div class="box">
          {{
            new BigNumber(store.state.teamDao.staked)
              .div(new BigNumber(10).pow(18))
              .toString()
          }}
          USDT
        </div>
        <button class="btn-line btn-warning" @click="handlerLeaveTeam">
          Exit
        </button>
      </div>
    </div>

    <div class="item">
      <div class="left">
        <i class="iconfont icon-gifts"></i>The dividends received
      </div>
      <div class="right">
        {{
          new BigNumber(store.state.teamDao.withdrawedRewardSCT)
            .div(new BigNumber(10).pow(18))
            .toString()
        }}
        SCT
      </div>
    </div>

    <div class="item">
      <div class="left">
        <i class="iconfont icon-gifts1"></i>Unclaimed dividends
      </div>
      <div class="right">
        {{
          new BigNumber(store.state.teamDao.unlockedRewardSCT)
            .minus(new BigNumber(store.state.teamDao.withdrawedRewardSCT))
            .div(new BigNumber(10).pow(18))
            .toString()
        }}
        SCT
        <button class="btn-line btn-success" @click="handlerReward">
          Collect
        </button>
      </div>
    </div>

    <div class="item">
      <div class="left">
        <i class="iconfont icon-team"></i>The number of people in my Community
      </div>
      <div class="right">
        {{ teamInfo.count }}
      </div>
    </div>

    <div class="item">
      <div class="left">
        <i class="iconfont icon-dict"></i>The number of people I invited
      </div>
      <div class="right">
        {{ teamInfo.redirect }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

const store = useStore();
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { TeamDaoFactory, teamDapApi } from "@/utils/pool/TeamDao";
import BigNumber from "bignumber.js";

const { proxy } = getCurrentInstance() as any;

const inviteLink = ref("");

const teamDaoFactory = new TeamDaoFactory();

const teamInfo = reactive({
  count: 0,
  redirect: 0
});
// 资格
const eligible = ref(false);

onMounted(async () => {
  const res = await teamDapApi.getTeamNumber(store.state.walletAccount);
  console.log(res, "==333===");
  // await teamDapApi.getRedirectInviteNumber();
  teamInfo.count = res.data.teamLeader.members.length;
  teamInfo.redirect = res.data.user.reffers.length;
});

const copyInvite = () => {
  if (inviteLink.value) proxy.$utils.handleCopy(inviteLink.value);
};

const handlerLeaveTeam = async () => {
  try {
    proxy.$showLoadingToast({});
    const res = await teamDaoFactory.unStake();
    await res.wait();
    await store.dispatch("getTeamDao");
    proxy.$showToast("Exit confirmed");
    //   @todo 自动返回上一层
  } catch (e) {
    console.log(e);
    proxy.$showToast("Failed to exit");
  } finally {
    proxy.$closeToast();
  }
};

const handlerReward = async () => {
  try {
    proxy.$showLoadingToast({});
    const res = await teamDaoFactory.withDrawReward();
    await res.wait();
    await store.dispatch("getTeamDao");
    proxy.$showToast("Claim successful");
  } catch (e) {
    console.log(e);
    proxy.$showFailToast("Claim failed");
  } finally {
    proxy.$closeToast();
  }
};
</script>

<style scoped lang="scss">
.partner-container {
  margin: 0 30px;
  padding: 20px 15px;
  background: rgba(43, 68, 129, 0.05);

  box-sizing: border-box;
  border: 2px solid #ffffff;

  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3),
    0px 0px 8px 0px rgba(57, 113, 243, 0.16);
  border-radius: 8px;

  .partner-header {
    .title {
      height: 21px;
      font-size: 20px;
      font-weight: bold;
      line-height: 21px;
      text-align: center;
      letter-spacing: 0px;

      text-shadow: 0px 0px 8px #3971f3;
    }
    .info {
      margin-top: 4px;
      margin-bottom: 20px;
      height: 21px;
      font-size: 16px;
      line-height: 21px;
      text-align: center;
      color: #ffffff;
      text-shadow: 0px 0px 8px #3971f3;
    }
  }
}
.item {
  font-size: 14px;
  display: flex;
  .left {
    text-align: left;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .iconfont {
      margin-right: 4px;
    }
  }
  .right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    text-align: right;
    .box {
      white-space: nowrap;
      display: flex;
    }
  }
}
.btn-line {
  margin-left: 10px;
  font-size: 12px;

  height: 21px;
  border-radius: 2px;
  opacity: 1;

  /* 自动布局 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px 9px;
  background: rgba(255, 255, 255, 0.05);
  box-sizing: border-box;
  border: 1px solid #ffffff;
  z-index: 1;
}
.btn-warning {
  color: #ff9500;
}
.btn-success {
  color: #27b53d;
}
.main_desc {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  display: flex;
  align-items: center;
}
.btn1 {
  width: 100%;
  height: 94px;
  margin: 0 auto;
  background: url("../../../assets/images/img25.png") no-repeat;
  background-size: 100% 100%;
  font-size: 14px;
  text-shadow: 0 0 4px rgba(0, 46, 255, 0.6);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
