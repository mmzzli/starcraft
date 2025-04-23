<template>
  <div>
    <p class="main_desc">
      Stake {{ stakingUsdt }}U (deposit and withdraw at any time; the data size
      can be configured in the official backend; if withdrawn, the partner
      status is lost and login to DAO governance is no longer possible. Only
      after successfully staking can you log in.
    </p>
    <button class="btn1" @click="toBeTeamLeader">
      Become a Community Leader
    </button>
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
.main_desc {
  margin: 20px 24px 0;
  font-size: 12px;
  text-align: center;
}
.btn1 {
  width: 100%;
  height: 94px;
  margin: 0 auto;
  background: url("../../../assets/images/img25.png") no-repeat;
  background-size: 100% 100%;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 4px rgba(0, 46, 255, 0.6);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
