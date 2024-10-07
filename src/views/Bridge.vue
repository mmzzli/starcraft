<template>
  <section class="container">
    <HeaderTitle :headTitle="'Bridge'" />
    <div class="container" style="display: flex; flex-direction: column; align-items: center; font-size: 24px;">
      <div style="display: flex;flex-direction: column;width: 100%;padding: 0 24px;">
        <div style="margin: 12px 0;">
          <select v-model="tokenAddress" style="width: 100%;font-size: 24px; background: none; color: white; padding: 12px; border-radius: 6px; border: 2px solid #fff;">
            <option v-for="item in tokenAddressList" :value="item[1]" :key="item[1]" selected>{{ item[0] }}</option>
          </select>
        </div>
        <div style="margin: 12px 0">
          <input style="width: 100%;" placeholder="Amount Token" v-model="tokenAmount" />
        </div>
        <div style="margin: 12px 0;">
          <input style="width: 100%;" placeholder="Address in Ton network" v-model="toAddress" />
        </div>
        <button class="btn1" @click="transfer">
          Transfer
        </button>

      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { ethers } from 'ethers';
import { getSigner } from 'starcraft-sdk';
import { Address } from '@ton/ton'

const store = useStore();
const route = useRoute();
const tokenAddressList = ref([
  ["SCT", '0x39159907efBF908D1B14CFB537D5db9aA6AAb3d7'],
])
const tokenAddress = ref(tokenAddressList.value[0][1])
const tokenAmount = ref('')
const toAddress = ref('')

onMounted(() => {
  if (route.query.Bridge) store.commit('Bridge', route.query.Bridge);
});

const transfer = () => {
  const addressTon = Address.parse(toAddress.value);
  const toAddressHash = addressTon.toRawString().split(":")[1]
  const contract = new ethers.Contract("0xf503239a8c9ded145263be0b4b274d2972aac1db", ["function lock(address token, uint256 amount, bytes32 to_address_hash)"], getSigner())
  contract.lock(
    tokenAddress.value,
    ethers.utils.parseEther(tokenAmount.value),
    "0x" + toAddressHash
  )
    .then((_: any) => _.wait())
    .then((_: any) => console.log(_))

}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  padding: 0 15px;
}

.btn1 {
  width: 100%;
  height: 94px;
  margin: 0 auto;
  background: url('../assets/images/img25.png') no-repeat;
  background-size: 100% 100%;
  font-size: 14px;
  text-shadow: 0 0 4px rgba(0, 46, 255, 0.6);
}
</style>
