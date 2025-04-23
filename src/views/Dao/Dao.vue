<template>
  <section class="container">
    <HeaderTitle headTitle="" />
    <!--    todo-->
    <div
      v-if="
        (parentTeamLeader.teamId && parentTeamLeader.teamId != '0') ||
          store.state.teamDao.teamId != '0'
      "
    >
      所属团队ID:{{ parentTeamLeader.teamId || store.state.teamDao.teamId }}
    </div>

    <div class="container2">
      <img class="banner" :src="img26" alt="" />

      <!--      挖矿中  且有 父级 users 合约 且没激活过-->

      <button
        class="btn1"
        @click="handlerActiveInvite"
        v-if="isShowInviteButton && !isLeaderDetailShow"
      >
        邀请激活
      </button>

      <!--      没有资格 提示-->
      <div
        v-if="store.state.teamDao.isNewTeamLeader && !isLeaderDetailShow"
        style="margin-top: 20px"
      >
        <p class="main_title">成为 Team Leader</p>
        <van-steps
          :active="active"
          active-color="#7AB2FF"
          inactive-color="#fff"
        >
          <van-step>校验权限</van-step>
          <van-step>授权</van-step>
          <van-step>质押</van-step>
        </van-steps>
      </div>

      <!--      激活
      1. 当前用户有上级，而且没有激活过,且具备成为 teamLeader 资格，且已经挖矿viewCanRegisterTeamLeader
      2.
      -->

      <div v-if="active == 0">
        当前权限不够，请求买星球，并质押后再来成为 Team Leader
        <button class="btn1" @click="handlerToHome">购买星球</button>
      </div>

      <div v-if="active == 1">
        <button
          class="btn1"
          @click="handlerApproveUsdt(store.state.teamDao.stakeAmount)"
        >
          授权
        </button>
      </div>

      <TeamLeader v-if="active == 2 && !isLeaderDetailShow" />

      <TeamLeaderDetail v-if="isLeaderDetailShow" />

      <div style="margin-top: 20px">
        <p>邀请参与DAO治理，获取更多权益。</p>
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
    :style="{ width: '100%', background: 'transparent' }"
  >
    <div class="popupbox1 rich_plan_popup">
      <img class="closebtn" :src="img32" alt="" @click="show = false" />
      <img class="banner" :src="img26" alt="" />
      <div class="main_title">接受Dao运营邀请，成为Dao成员</div>
      <div class="main_desc">是否接受 {{ inviteCode }} 的邀请：</div>
      <div class="btn-group">
        <button class="btn1" @click="handlerGetInvited">确认接受</button>
      </div>
      <div class="tips_content">
        接收邀请将花费
        {{ inviteAmount }}
        u购买一个星球，然后自行参与星球挖矿，后激活邀请后，邀请人可收到收益！
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
    const tx = await teamDaoFactory.activateInviter();
    await tx.wait();
    await canRegisterTeamLeader();
    await store.dispatch("getTeamDao");
    await calcInviteButton();
  } else {
    proxy.$showToast("请先购买星球/且挖矿");
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
    const res = await approveUsdt();
    await res.wait();
    await checkApprove(balance);
  } catch (e) {
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
    proxy.$showToast("邀请失败");
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
  if (!(await canRegisterTeamLeader())) {
    isShowInviteButton.value = false;
    return;
  }

  if (parentTeamLeader.teamId && parentTeamLeader.teamLeaderAddress) {
    const res = await teamDapApi.getInviteActived(store.state.walletAccount);
    console.log(!res.data.user.hasActived, "===hasActived=====");
    isShowInviteButton.value = !res.data.user.hasActived;
    return;
  }
  isShowInviteButton.value = true;
};

const init = async () => {
  try {
    console.log(3333, "------");

    const balance = await teamDaoFactory.getNeedTeamItemUsdtNum();
    console.log(balance, "------");
    inviteAbsAmount.value = balance.toString();
    inviteAmount.value = new BigNumber(balance.toString())
      .dividedBy(new BigNumber(10).pow(18))
      .toString();
    console.log(inviteAmount.value, "---------");

    await getCurAddressTeamLeaderInfo();
    // 获取它的父级信息
    if (inviteCode) {
      const res = await teamDaoFactory.users(store.state.walletAccount);
      const data = parseInt(res, 16);
      isApprovedInvited.value = !data;
      await getCurAddressTeamLeaderInfo();
    }
    console.log(4444);

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
  padding: 0 15px;
}

.banner {
  width: 100%;
  height: auto;
  margin-bottom: 10px;
}

.main_title {
  color: #fff;
  text-align: center;
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
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
  font-size: 14px;
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
