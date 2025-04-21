<template>
  <div>
    <div class="item">
      <div class="left">
        <span>合伙人ID</span>
        <svg
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4411"
          fill="#A53FC1"
          width="40"
          height="40"
        >
          <path
            d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136V232h752v560z"
            p-id="4412"
          ></path>
          <path
            d="M610.3 476h123.4c1.3 0 2.3-3.6 2.3-8v-48c0-4.4-1-8-2.3-8H610.3c-1.3 0-2.3 3.6-2.3 8v48c0 4.4 1 8 2.3 8zM615.1 620h185.7c3.9 0 7.1-3.6 7.1-8v-48c0-4.4-3.2-8-7.1-8H615.1c-3.9 0-7.1 3.6-7.1 8v48c0 4.4 3.2 8 7.1 8zM224 673h43.9c4.2 0 7.6-3.3 7.9-7.5 3.8-50.5 46-90.5 97.2-90.5s93.4 40 97.2 90.5c0.3 4.2 3.7 7.5 7.9 7.5H522c4.6 0 8.2-3.8 8-8.4-2.8-53.3-32-99.7-74.6-126.1 18.1-19.9 29.1-46.4 29.1-75.5 0-61.9-49.9-112-111.4-112s-111.4 50.1-111.4 112c0 29.1 11 55.5 29.1 75.5-42.7 26.5-71.8 72.8-74.6 126.1-0.4 4.6 3.2 8.4 7.8 8.4z m149-262c28.5 0 51.7 23.3 51.7 52s-23.2 52-51.7 52-51.7-23.3-51.7-52 23.2-52 51.7-52z"
            p-id="4413"
          ></path>
        </svg>
      </div>
      <div class="right">{{ store.state.teamDao.teamId }}</div>
    </div>

    <div class="item">
      <div class="left">
        <span>股份余额：</span>
      </div>
      <div class="right">
        {{
          new BigNumber(store.state.teamDao.limitRewardSCT)
            .div(new BigNumber(10).pow(18))
            .toString()
        }}
        sct
      </div>
    </div>
    <div class="main_desc">
      <p>
        我的质押保证金：{{
          new BigNumber(store.state.teamDao.staked)
            .div(new BigNumber(10).pow(18))
            .toString()
        }}
        USDT
      </p>
      <button class="btn-line" @click="handlerLeaveTeam">退出</button>
    </div>

    <div class="item">
      <div class="left">
        已领到红利：
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
        待领到的红利：
      </div>
      <div class="right">
        {{
          new BigNumber(store.state.teamDao.unlockedRewardSCT)
            .minus(new BigNumber(store.state.teamDao.withdrawedRewardSCT))
            .div(new BigNumber(10).pow(18))
            .toString()
        }}
        SCT
        <button class="btn-line" @click="handlerReward">领取</button>
      </div>
    </div>

    <div class="item">
      <div class="left">
        我的团队人数：
      </div>
      <div class="right">
        {{ teamInfo.count }}
      </div>
    </div>

    <div class="item">
      <div class="left">
        我的直推人数：
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
    const res = await teamDaoFactory.unStake();
    await res.wait();
    await store.dispatch("getTeamDao");
    proxy.$showToast("退出成功");
    //   @todo 自动返回上一层
  } catch (e) {
    console.log(e);
    proxy.$showToast("退出失败");
  }
};

const handlerReward = async () => {
  try {
    const res = await teamDaoFactory.withDrawReward();
    await res.wait();
    await store.dispatch("getTeamDao");
    proxy.$showToast("领取成功");
  } catch (e) {
    console.log(e);
    proxy.$showFailToast("领取失败");
  }
};
</script>

<style scoped lang="scss">
.item {
  display: flex;
  .left {
    width: 200px;
    text-align: right;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .right {
    display: flex;
    align-items: center;
  }
}
.btn-line {
  margin-left: 10px;
  padding: 5px 8px;
  border-radius: 100px;
  border: 2px solid rgba(122, 178, 255, 0.6);
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
