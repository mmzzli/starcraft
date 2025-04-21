<template>
  <div>
    <p class="main_desc">
      质押{{
        stakingUsdt
      }}U（随进随出，数据大小官方后台可以配置；领走了就失去了合伙人身份。无法登录进去DAO治理。只有质押进去成功后才可以登录；
    </p>
    <button class="btn1" @click="toBeTeamLeader">成为团队长</button>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref } from "vue";
import { TeamDaoFactory } from "@/utils/pool/TeamDao";
import { useStore } from "vuex";
import BigNumber from "bignumber.js";

const store = useStore();

const { proxy } = getCurrentInstance() as any;
const inviteLink = ref("");
const toBeTeamLeader = async () => {
  const teamFactory = new TeamDaoFactory();
  const res = await teamFactory.registerTeamLeader();
  await res.wait();
  await store.dispatch("getTeamDao");
};

const copyInvite = () => {
  if (inviteLink.value) proxy.$utils.handleCopy(inviteLink.value);
};

const stakingUsdt = computed(() => {
  return new BigNumber(store.state.teamDao.stakeAmount)
    .div(new BigNumber(10).pow(18))
    .toString();
});
</script>

<style scoped lang="scss">
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
