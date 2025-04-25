<template>
  <section class="container">
    <HeaderTitle headTitle="" />
    <div
      class="team-header"
      v-if="
        (parentTeamLeader.teamId && parentTeamLeader.teamId != '0') ||
          store.state.teamDao.teamId != '0'
      "
    >
      <div class="left">
        <div class="icon">
          <i class="iconfont icon-team"></i>
        </div>
        <div class="info">
          <div class="top">Community Affiliation</div>
          <div class="down">
            Community ID:{{
              parentTeamLeader.teamId || store.state.teamDao.teamId
            }}
          </div>
        </div>
      </div>
      <div class="right">
        <button
          @click="handlerActiveInvite"
          v-if="isShowInviteButton && !isLeaderDetailShow"
        >
          Invitation activation
        </button>
      </div>
    </div>

    <div class="container2">
      <img class="banner" :src="img26" alt="" />

      <!--      挖矿中  且有 父级 users 合约 且没激活过-->

      <div
        v-if="store.state.teamDao.isNewTeamLeader && !isLeaderDetailShow"
        class="team-progress"
      >
        <p class="team-progress-title">Become a Community Leader</p>
        <div class="team-progress-main">
          <div
            class="team-progress-main-line"
            :style="`width:${((active * 1) / 3) * 100}%`"
          ></div>
        </div>
        <div class="team-progress-text">
          <div class="item">Verify permission</div>
          <div class="item">Authorization</div>
          <div class="item">Pledge</div>
        </div>
      </div>

      <div class="permission-box" v-if="active == 0 && !isLeaderDetailShow">
        <div class="info">
          The current permissions are insufficient. Request to purchase a
          planet, stake it, and then become a Community Leader again
        </div>
        <button class="btn1" @click="handlerToHome">BUY PLANET</button>
      </div>

      <div v-if="active == 1">
        <button
          class="btn1"
          @click="handlerApproveUsdt(store.state.teamDao.stakeAmount)"
        >
          Approve
        </button>
      </div>

      <TeamLeader v-if="active == 2 && !isLeaderDetailShow" />

      <TeamLeaderDetail v-if="isLeaderDetailShow" />

      <div class="invite-box">
        <p>Invite to participate in DAO governance and gain more benefits.</p>
        <button class="btn1" @click="getInvitationLink">
          Copy your invitation link
        </button>
      </div>
    </div>
  </section>
  <!--  show  @todo 要处理的逻辑包含 -->
  <!-- 有上级之后不能接受邀请    是团队长也不能接受邀请    自己不能邀请自己-->
  <van-popup
    v-model:show="show"
    class="van-popup-dialog"
    :style="{ width: '100%', background: 'transparent' }"
  >
    <div class="popupbox1 rich_plan_popup">
      <img class="closebtn" :src="img32" alt="" @click="show = false" />
      <img class="banner" :src="img26" alt="" />
      <div class="main_title">
        Accept the DAO operation invitation and become a DAO member.
      </div>
      <div class="main_desc">Do you accept {{ inviteCode }}'s invitation?</div>
      <div class="btn-group">
        <button class="btn1" @click="handlerGetInvited">Confirm</button>
      </div>
      <div class="tips_content">
        Accepting the invitation requires spending {{ inviteAmount }}u to buy a
        planet and start mining. Once activated, the inviter will earn rewards!
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts" setup>
import BigNumber from "bignumber.js";
import { computed, effect, getCurrentInstance, reactive, ref } from "vue";
import img26 from "@/assets/images/img26.png";
import TeamLeader from "@/views/Dao/components/TeamLeader.vue";
import TeamLeaderDetail from "@/views/Dao/components/TeamLeaderDetail.vue";
import { onMounted } from "vue";
import { useStore } from "vuex";
import { TeamDaoFactory, teamDapApi } from "@/utils/pool/TeamDao";
import { contract, token, util } from "@/utils";
import { useRoute, useRouter } from "vue-router";
import img32 from "@/assets/images/img32.svg";

const active = ref(1);
const store = useStore();
const router = useRouter();
const route = useRoute();
const eligibility = ref(false);
const { proxy } = getCurrentInstance() as any;
const teamDaoFactory = new TeamDaoFactory();
const { inviteCode } = route.query;
const inviteAmount = ref("0");
const inviteAbsAmount = ref("0");

// 检查资格(持有正在正常挖矿的星球才可以参加)
const canRegisterTeamLeader = async () => {
  return !!(await teamDaoFactory.canRegisterTeamLeader());
};

const isApprovedInvited = ref(!!inviteCode);
console.log(inviteCode, !!inviteCode, typeof inviteCode, "inviteCode");
const show = ref(isApprovedInvited);
const parentTeamLeader = reactive({
  teamId: "",
  teamLeaderAddress: ""
});

const handlerActiveInvite = async () => {
  if ((await canRegisterTeamLeader()) && parentTeamLeader.teamId) {
    const tx = await teamDaoFactory.activateInviter(
      parentTeamLeader.teamLeaderAddress
    );
    await tx.wait();
    await canRegisterTeamLeader();
    await store.dispatch("getTeamDao");
    await calcInviteButton();
  } else {
    proxy.$showToast("Please purchase a planet first and start mining.");
  }
};

const isLeaderDetailShow = computed(() => {
  return (
    store.state.teamDao.teamId &&
    store.state.teamDao.effect &&
    new BigNumber(store.state.teamDao.stakeAmount).isGreaterThan(0)
  );
});
const checkApprove = async balance => {
  const res = await teamDaoFactory.checkApprove(
    token().USDT,
    contract().TEAM_DAO,
    balance
  );

  if (res) {
    active.value = 2;
  } else {
    active.value = 1;
  }
};
// 检查授权是否足够
const handlerApproveUsdt = async (balance: string | number) => {
  try {
    console.log(3333);
    const res = await approveUsdt();
    await res.wait();
    await checkApprove(balance);
  } catch (e) {
    // @ts-ignore
    proxy.$showFailToast(e?.message);
    console.log(e);
  }
};

const allowanceApprove = async (balance: string) => {
  // 授权额度是否够用
  const res = await teamDaoFactory.checkApprove(
    token().USDT,
    contract().TEAM_DAO,
    balance
  );
  if (!res) {
    try {
      const approveRes = await approveUsdt();
      await approveRes.wait();
    } catch (e) {
      throw e;
    }
  }
};

// 进行授权
const approveUsdt = async () => {
  return await teamDaoFactory.setApprove(contract().TEAM_DAO);
};
// 获取邀请链接
const getInvitationLink = async () => {
  const url =
    window.location.origin +
    `/#${route.fullPath}?inviteCode=` +
    store.state.walletAccount;
  proxy.$utils.handleCopy(url);
  proxy.$showToast("invitation url is copy success");
};

// 接受邀请
const handlerGetInvited = async () => {
  try {
    if (inviteCode) {
      await allowanceApprove(inviteAbsAmount.value);
      const res = await teamDaoFactory.bindInviter(inviteCode as string);
      await res.wait();
      console.log(res);
      await init();
    }
  } catch (e) {
    console.log(e);
    proxy.$showToast("Invitation failed.");
  } finally {
    show.value = false;
  }
};
const getCurAddressTeamLeaderInfo = async () => {
  try {
    const address = await teamDaoFactory.getTeamLeaderAddress(
      store.state.walletAccount
    );
    const isAddress = parseInt(address, 16).toString() !== "0";
    if (isAddress) {
      //   获取 teamLeader 信息
      const teamLeaderInfo = await teamDaoFactory.teamLeaderInfo(address);
      parentTeamLeader.teamId = teamLeaderInfo.leaderId?.toString();
      parentTeamLeader.teamLeaderAddress = address;
    }
  } catch (e) {
    console.log(3333);
  }
};

const isShowInviteButton = ref(false);

const calcInviteButton = async () => {
  // 如果没有成为团队长权限为 false
  if (!(await canRegisterTeamLeader())) {
    isShowInviteButton.value = false;
    return;
  }
  console.log(typeof store.state.teamDao.teamId, "store.state.teamDao.teamId");

  // 父的 teamID 和 teamLeaderAddress 都不为空，则判断是否已经激活了邀请
  if (parentTeamLeader.teamId && parentTeamLeader.teamLeaderAddress) {
    const res = await teamDapApi.getInviteActived(store.state.walletAccount);
    console.log(!res.data.user.hasActived, "===hasActived=====");
    isShowInviteButton.value = !res.data.user.hasActived;
    return;
  }
  // 当前是团队长隐藏掉
  if (store.state.teamDao.teamId != "0") {
    isShowInviteButton.value = false;
    return;
  }

  isShowInviteButton.value = true;
};

const init = async () => {
  try {
    const balance = await teamDaoFactory.getNeedTeamItemUsdtNum();
    inviteAbsAmount.value = balance.toString();
    inviteAmount.value = new BigNumber(balance.toString())
      .dividedBy(new BigNumber(10).pow(18))
      .toString();

    await getCurAddressTeamLeaderInfo();
    // 获取它的父级信息
    if (inviteCode) {
      const res = await teamDaoFactory.users(store.state.walletAccount);
      const data = parseInt(res, 16);
      await getCurAddressTeamLeaderInfo();

      if (inviteCode === store.state.walletAccount) {
        console.log(9999);
        proxy.$showToast("Invalid invitation");
        isApprovedInvited.value = false;
        return;
      }

      await store.dispatch("getTeamDao");
      console.log(
        Number(store.state.teamDao.teamId),
        "===store.state.teamDao.teamId==="
      );
      if (
        !new BigNumber(Number(store.state.teamDao.teamId).toString()).isZero()
      ) {
        proxy.$showToast("Invalid invitation");

        isApprovedInvited.value = false;
        return;
      }
      // 如果有父级需隐藏
      if (data) {
        console.log(777);
        proxy.$showToast("Invalid invitation");
        isApprovedInvited.value = false;
        return;
      }
    }

    //  1. 获取 teamDao 信息
    await store.dispatch("getTeamDao");
    // 当前用户不是 teamLeader
    if (store.state.teamDao.isNewTeamLeader) {
      // 2.查看资格
      eligibility.value = await canRegisterTeamLeader();
      if (eligibility.value) {
        active.value = 1;
        // 检查授权金额是否满足
        await checkApprove(store.state.teamDao.stakeAmount);
      } else {
        active.value = 0;
      }
    } else {
      // store.state.teamDao.
    }
  } catch (e) {
    console.log(e);
  }
};
onMounted(async () => {
  await init();
  await calcInviteButton();
});

const handlerToHome = () => {
  router.push({ path: "/" });
};
</script>

<style lang="scss" scoped>
.van-popup-dialog {
  .main_title {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
  }
  .tips_content {
    margin-bottom: 20px;
    font-size: 12px;
  }
}
.team-header {
  display: flex;
  height: 76px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 0 24px;
  box-sizing: border-box;
  border: 2px solid #ffffff;
  border-radius: 6px;

  .left {
    display: flex;
    .icon {
      width: 46px;
      height: 46px;
      border-radius: 23px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }
    .info {
      margin-left: 14px;
      display: flex;
      flex-direction: column;
      .top {
        text-shadow: 0px 0px 8px #3971f3;
        font-size: 14px;
      }
      .down {
        font-size: 24px;
        font-weight: bold;
      }
    }
  }
  .right {
    display: flex;
    padding: 6px;
    justify-content: center;
    align-items: center;
    button {
      padding: 0 6px;
      width: 100%;
      height: 33px;
      font-size: 12px;
      cursor: pointer;
      background: rgb(83 172 255);
      box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
      border-radius: 6px;
    }
  }
}
.team-progress {
  margin: 0 24px;
  &-title {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    line-height: 32px;
    text-align: center;
    letter-spacing: 0px;
    color: #ffffff;
    text-shadow: 0px 0px 8px #3971f3;
    z-index: 0;
    margin-bottom: 14px;
  }
  &-main {
    height: 8px;
    display: flex;
    border-radius: 8px;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.001),
        rgba(0, 0, 0, 0.001)
      ),
      linear-gradient(0deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), #ffffff;

    box-shadow: 0px 0px 8px 0px #3971f3;

    &-line {
      border-radius: 8px;
      min-width: calc(1 / 3) * 100%;
      background: linear-gradient(90deg, #73a2ff 0%, #0055ff 100%);
      box-shadow: 0px 0px 10px 0px rgba(42, 75, 141, 0.5);
      height: 100%;
    }
  }
  &-text {
    margin-top: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 20px;
    font-size: 14px;
    line-height: 20px;
    .item {
      width: calc(1 / 3) * 100%;
      text-align: center;
      &:last-of-type {
        text-align: right;
      }
      &:first-of-type {
        text-align: left;
      }
    }
  }
}
.permission-box {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  .info {
    margin: 0 24px;
    padding: 2px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    box-sizing: border-box;
    border: 1px solid #4a7ab9;
    font-size: 12px;
    text-align: center;
    line-height: 22px;
  }
}
.invite-box {
  margin-top: 20px;
  p {
    margin: 0 35px;
    font-size: 14px;
    font-weight: normal;
    line-height: 20px;
    text-align: center;
  }
}
.popupbox1 {
  width: 100%;
}
.container {
  :deep(.van-steps) {
    background: transparent;
  }
  :deep(.van-step--horizontal .van-step__circle-container) {
    background: transparent;
  }
  :deep(.van-step--finish) {
    color: #7ab2ff;
  }
  :deep(.van-step--horizontal .van-step__icon) {
    background: #fff;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.container2 {
  width: 100%;
}

.banner {
  width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.main_desc {
  color: #fff;
  text-align: center;
  font-size: 0.8rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: capitalize;
  margin-top: 0.6rem;
  margin-bottom: 1rem;
}

.btn1 {
  width: 100%;
  height: 94px;
  margin: 0 auto;
  background: url("../../assets/images/img25.png") no-repeat;
  background-size: 100% 100%;
  font-size: 18px;
  font-weight: bold;
  line-height: 32px;
  text-shadow: 0 0 4px rgba(0, 46, 255, 0.6);
}

.data_container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.75rem;
  margin-bottom: 1.75rem;
}

.data-item {
  width: 33.3%;
  text-align: center;
}

.data-data {
  color: #fff;
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: 1.1rem;
  .data-num {
    display: flex;
    align-items: center;
    justify-content: center;
    p {
      font-size: 1.2rem;
      margin-right: 0.2rem;
    }
  }
}

.data-title {
  color: #fff;
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-top: 0.22rem;
}

.data-line {
  width: 1px;
  height: 2rem;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 0px 10px 0px #2e59ff;
}

.record_list {
  margin-top: 0.6rem;
}

.record_item {
  display: flex;
  border-top: 1px solid #fff;
  border-bottom: 1px solid #fff;
  flex-wrap: wrap;
  padding: 0.6rem 1.2rem 0;
  margin-bottom: 1rem;

  .item {
    width: 50%;
    margin-bottom: 0.8rem;

    .item_title {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
      font-style: normal;
    }

    .item_data {
      color: #fff;
      font-size: 0.75rem;
      font-style: normal;
      font-weight: 700;
      word-wrap: break-word;
    }
  }
}
</style>
