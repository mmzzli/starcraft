<template>
  <section class="container container2" v-if="isAdmin">
    <!-- 加个管理员页面，用管理员地址连接钱包后，显示管理员方法的输入框和按钮比如
    1.调整SCT产量
    当前产量 每区块 0.26 SCT
    输入框 输入新的产量 每区块 ____ SCT
    确认修改
    2.提取合约SCT余额
    1)挖矿合约 当前余额 3242332323 SCT 
    输入框 输入提取数量 _____SCT
    确认提取
    2)盲盒合约 当前余额 3242332323 SCT 
    输入框 输入提取数量 _____SCT
    确认提取
    3)商店合约 当前余额 3242332323 SCT 
    输入框 输入提取数量 _____SCT
    确认提取 -->
    <h2>调整区块产量：</h2>
    <h4>
      当前每区块产量：{{ proxy.$utils.formatNumber(tokensPerBlock, 4) }} SCT
    </h4>
    <div class="inputbox">
      调整产量：<input
        type="number"
        v-model="inputVal1"
        placeholder="输入每区块产量"
      />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toSet"
        >确认修改</van-button
      >
    </div>
    <h2>调整上级奖励(%)：</h2>
    <div class="inputbox">
      调整直接：<input
        type="number"
        v-model="inputVal2"
        :max="100"
        placeholder="输入直接上级奖励"
      />
    </div>
    <div class="inputbox">
      调整间接：<input
        type="number"
        v-model="inputVal3"
        :max="100"
        placeholder="输入间接上级奖励"
      />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toSetReward"
        >确认修改</van-button
      >
    </div>

    <h2>空投星球：</h2>
    <div class="inputbox">
      空投地址：<input
        type="text"
        v-model="airdropAddress"
        placeholder="输入空投地址"
      />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toAirdrop"
        >确认空投</van-button
      >
    </div>

    <!-- <h2>调整L3星球价格：</h2>
    <h4>当前价格：{{ proxy.$utils.formatNumber(L3Price, 4) }} L3</h4>
    <div class="inputbox">调整价格：<input type="number" v-model="inputVal4" placeholder="输入L3星球价格" /></div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toSetL3Price">确认修改</van-button>
    </div> -->

    <h2>提取合约余额：</h2>
    <h4>
      挖矿合约 当前余额：{{ proxy.$utils.formatNumber(balancePlanetPool, 4) }}
      SCT
    </h4>
    <div class="inputbox">
      提取数量：
      <input type="number" v-model="inputNum1" placeholder="输入提取数量" />
    </div>
    <div class="inputbox">
      提取地址：
      <input type="text" v-model="inputAddr1" placeholder="输入提取地址" />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toClaimPlanetPool"
        >确认提取</van-button
      >
    </div>
    <h4>
      星球盲盒 当前余额：{{ proxy.$utils.formatNumber(balanceSCPBox, 4) }} SCT
    </h4>
    <div class="inputbox">
      提取数量：
      <input type="number" v-model="inputNum2" placeholder="输入提取数量" />
    </div>
    <div class="inputbox">
      提取地址：
      <input type="text" v-model="inputAddr2" placeholder="输入提取地址" />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toClaimSCPBox"
        >确认提取</van-button
      >
    </div>
    <h4>星球盲盒 当前余额：{{ proxy.$utils.formatNumber(balanceL3, 4) }} L3</h4>
    <div class="inputbox">
      提取数量：
      <input type="number" v-model="inputNum5" placeholder="输入提取数量" />
    </div>
    <div class="inputbox">
      提取地址：
      <input type="text" v-model="inputAddr5" placeholder="输入提取地址" />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toClaimL3"
        >确认提取</van-button
      >
    </div>
    <h4>
      设施盲盒 当前余额：{{ proxy.$utils.formatNumber(balanceSCFBox, 4) }} SCT
    </h4>
    <div class="inputbox">
      提取数量：
      <input type="number" v-model="inputNum3" placeholder="输入提取数量" />
    </div>
    <div class="inputbox">
      提取地址：
      <input type="text" v-model="inputAddr3" placeholder="输入提取地址" />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toClaimSCFBox"
        >确认提取</van-button
      >
    </div>
    <h4>
      商店合约 当前余额：{{ proxy.$utils.formatNumber(balanceShop, 4) }} SCT
    </h4>
    <div class="inputbox">
      提取数量：
      <input type="number" v-model="inputNum4" placeholder="输入提取数量" />
    </div>
    <div class="inputbox">
      提取地址：
      <input type="text" v-model="inputAddr4" placeholder="输入提取地址" />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toClaimShop"
        >确认提取</van-button
      >
    </div>
    <h4>设置燃料购买标的及价格</h4>
    <div class="inputbox">
      <van-field
        v-model="fieldValue"
        is-link
        readonly
        label="燃料"
        placeholder="选择燃料"
        @click="showPicker = true"
      />
      <van-popup v-model:show="showPicker" round position="bottom">
        <van-picker
          :columns="columns"
          @cancel="showPicker = false"
          @confirm="onConfirm"
        />
      </van-popup>
    </div>
    <div class="inputbox">
      燃料标的:
      <input
        type="text"
        v-model="inputAddr6"
        placeholder="输入设置购买燃料标的"
      />
    </div>
    <div class="inputbox">
      标的价格:
      <input
        type="number"
        v-model="inputPrice"
        placeholder="输入标的购买价格"
      />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toSetShop"
        >确认修改</van-button
      >
    </div>
  </section>
  <section class="container container2">
    <h2>设置TeamDao：</h2>
    <div v-if="adminList.includes(store.state.walletAccount)">
      <h4>添加管理员</h4>
      <div class="inputbox">
        收款人：<input type="text" v-model="manager" placeholder="请输入地址" />
      </div>
      <div class="inputbtn">
        <van-button size="small" type="primary" @click="handlerManage"
          >添加管理员</van-button
        >
      </div>
    </div>

    <h4>设置收款人</h4>
    <div class="inputbox">
      收款人：<input
        type="text"
        v-model="inputTreasury"
        placeholder="请输入地址"
      />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="setTreasury"
        >设置收款人</van-button
      >
    </div>

    <!--    <h2>封禁解封团队长</h2>-->
    <!--    <div class="inputbox">封禁解封团队长：<input type="text" v-model="inputLeaderEffect" placeholder="请输入地址" /></div>-->
    <!--    <div class="inputbtn">-->
    <!--      <van-button size="small" type="primary" @click="setLeaderEffect(true)">解封团队长</van-button>-->
    <!--      <van-button size="small" type="warning" @click="setLeaderEffect(false)">封禁团队长</van-button>-->
    <!--    </div>-->

    <h4>设置团队长起始id</h4>
    <div class="inputbox">
      超始 ID：<input
        type="number"
        v-model="inputStartId"
        placeholder="请输入超始 ID"
      />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="setCurrentLeaderID"
        >设置团队长起始id</van-button
      >
    </div>

    <h4>设置单次解锁sct数量： {{ onceBindRewardSct }}</h4>
    <div class="inputbox">
      设置单次解锁sct数量：<input
        type="number"
        v-model="inputOnceBindRewardSct"
        placeholder="请输入Sct数量"
      />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="setOnceBindRewardSct"
        >设置单次解锁sct数量</van-button
      >
    </div>

    <h4>设置邀请购买星球花费金额：{{ bindUsdtAmount }}</h4>
    <div class="inputbox">
      金额：<input
        type="number"
        v-model="inputBindUsdtAmount"
        placeholder="请输入购买星球花费金额"
      />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="setBindUsdtAmount"
        >设置邀请购买星球花费金额</van-button
      >
    </div>

    <h4>提取余额</h4>
    <div class="inputbox">
      token地址：<input
        type="text"
        v-model="inputclaimTokenAddress"
        placeholder="请输入token地址"
      />
    </div>
    <div class="inputbox">
      提取地址：<input
        type="text"
        v-model="inputclaimEOAAddress"
        placeholder="请输入提取地址"
      />
    </div>
    <div class="inputbox">
      提取余额：<input
        type="number"
        v-model="inputclaimToken"
        placeholder="请输入提取余额"
      />
    </div>

    <div class="inputbtn">
      <van-button size="small" type="primary" @click="claimToken"
        >提取余额</van-button
      >
    </div>
  </section>
  <section class="container container2" v-if="isBlackList">
    <h4>添加FILWT黑名单</h4>
    <div class="inputbox">
      添加地址：
      <input type="text" v-model="inputAddr7" placeholder="输入添加地址" />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toAdd"
        >确认添加</van-button
      >
    </div>
    <h4>移除FILWT黑名单</h4>
    <div class="inputbox">
      移除地址：
      <input type="text" v-model="inputAddr8" placeholder="输入移除地址" />
    </div>
    <div class="inputbtn">
      <van-button size="small" type="primary" @click="toRemove"
        >确认移除</van-button
      >
    </div>
  </section>
</template>

<script lang="ts" setup>
import {
  ref,
  reactive,
  onMounted,
  getCurrentInstance,
  computed,
  watch
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  util,
  erc20,
  token,
  contract,
  getSigner,
  planetPool,
  scpBox,
  scpBox2,
  shop,
  scfBox,
  rpcProvider
} from "@/utils";
import BigNumber from "bignumber.js";
import { ContractConnect } from "@/constants/sdk/index";
import { FILWT } from "@/constants/config";
import filwtAbi from "@/abis/filwt.json";
import { TeamDaoFactory } from "@/utils/pool/TeamDao";

const { proxy } = getCurrentInstance() as any;
const store = useStore();
const router = useRouter();
const route = useRoute();
const walletAccount = computed(() => store.state.walletAccount);
const tokensPerBlock = ref(0);
const L3Price = ref(0);
const inputVal1: any = ref(null);
const inputVal2: any = ref(null);
const inputVal3: any = ref(null);
const inputVal4: any = ref(null);
const inputNum1: any = ref(null);
const inputNum2: any = ref(null);
const inputNum3: any = ref(null);
const inputNum4: any = ref(null);
const inputNum5: any = ref(null);
const inputAddr1: any = ref(null);
const inputAddr2: any = ref(null);
const inputAddr3: any = ref(null);
const inputAddr4: any = ref(null);
const inputAddr5: any = ref(null);
const inputAddr6: any = ref(null);
const inputPrice: any = ref(null);
const inputAddr7: any = ref(null);
const inputAddr8: any = ref(null);
const inputTreasury: any = ref(null);
const inputLeaderEffect: any = ref(null);
const inputStartId: any = ref(null);
const inputOnceBindRewardSct: any = ref(null);
const inputBindUsdtAmount: any = ref(null);
const inputclaimToken: any = ref(null);
const inputclaimTokenAddress: any = ref(null);
const inputclaimEOAAddress: any = ref(null);

const columns = [
  { text: "FUEL", value: "0x3DD0623c9e2DC16fA9d4280006C0462e646a034a" },
  { text: "ADFUEL", value: "0xC6962A56A58D3FC2c8c0Fbe38100B27699A6df4F" }
];
const fieldValue = ref("");
const fieldValueUse = ref("");
const showPicker = ref(false);

// getRoleMemberCount  获取某一种权限的个数，再根据 个数的下标获取相应的管理员地址
const managerRole = ref("");

const manager = ref("");
const getRoleMemberCount = ref(0);
const manageList = ref<any[]>([]);
const adminList = ref<any[]>([]);

const admins = [
  // '0x5c7fbf5dE528Bf57057c83F2E89e3155Ecf4397a',
  // '0x9fe8CC2AdA78b6Eb6f89a6Cd019a12206c335Ce8',
  "0x88556628C8eB2331be8472A4425ceA4805c54fCb",
  "0xa107aBb13441fA3651B4A3a56F65B7337c970A76",
  "0xcC4a1f9eD62122B1739E1b767Ec389c0567476dF",
  "0xa744118AF77E66A193601ea1456d7aFb27DC7b5C"
];
const blackList = [
  "0x9fe8CC2AdA78b6Eb6f89a6Cd019a12206c335Ce8",
  "0x2ec00e1714178Eb4C772d61300d3e3F7d30E6415"
];
const isAdmin = ref(false);
const isBlackList = ref(false);
const balancePlanetPool = ref(0);
const balanceSCPBox = ref(0);
const balanceSCFBox = ref(0);
const balanceShop = ref(0);
const balanceL3 = ref(0);

const airdropAddress: any = ref("");
const teamDaoFactory = new TeamDaoFactory();

const getAdminAndManagerList = async () => {
  const list = await teamDaoFactory.getManagerList();
  manageList.value.push(...list);
  // 管理员列表
  adminList.value.push(...(await teamDaoFactory.getAdminList()));
};
onMounted(async () => {
  managerRole.value = await teamDaoFactory.managerRole();
  await getAdminAndManagerList();
  await getOnceBindRewardSct();
  await getBindUdstAmount();
  if (walletAccount.value) {
    console.log(walletAccount.value);
    isAdmin.value = admins.includes(walletAccount.value);
    if (isAdmin.value) {
      getTokensPerBlock();
      // getL3Price();
      getBalancePlanetPool();
      getBalanceSCPBox();
      getBalanceSCFBox();
      getBalanceShop();
      getBalanceL3();
    }
    isBlackList.value = blackList.includes(walletAccount.value);
  }
});

const setAddminAddress = async () => {};
/**L3星球价格 */
const getL3Price = async () => {
  try {
    const res = await scpBox().boxPrice(1);
    L3Price.value = proxy.$utils.utilFormat(util.formatEther(res));
  } catch (err) {
    console.error(err);
    proxy.$showFailToast("Error");
  }
};
/**获取某ID的币种每区块产量（传0和1，0和1都是SCT，页面上把这2个产量加起来） */
const getTokensPerBlock = async () => {
  try {
    const res = await planetPool().tokensPerBlock(0);
    const res2 = await planetPool().tokensPerBlock(1);
    tokensPerBlock.value = proxy.$utils.utilFormat(
      util.formatEther(res.add(res2))
    );
  } catch (err) {
    console.error(err);
    proxy.$showFailToast("Error");
  }
};
/**调整SCT产量 0 87%；1 13%； */
const toSet = async () => {
  if (!walletAccount.value) return proxy.$showToast("请链接钱包");
  if (!inputVal1.value) return proxy.$showToast("请输入");
  const inputVal = new BigNumber(inputVal1.value);
  const num1 = inputVal.times(0.87).toString();
  const num2 = inputVal.times(0.13).toString();
  console.log("调整SCT产量", inputVal.toString(), num1, num2);
  proxy.$showLoadingToast({});
  try {
    const tx = await planetPool()
      .connect(getSigner())
      .setTokensInfo(
        [token().SCT, token().SCT],
        [util.parseUnits(num1), util.parseUnits(num2)]
      );
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      getTokensPerBlock();
      inputVal1.value = null;
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
/** */
const toAirdrop = async () => {
  if (!walletAccount.value) return proxy.$showToast("请链接钱包");
  if (!airdropAddress.value) return proxy.$showToast("请输入");
  proxy.$showLoadingToast({});
  try {
    const tx = await scpBox2()
      .connect(getSigner())
      .draw(0, 1, [airdropAddress.value]);
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      airdropAddress.value = "";
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
/**调整上级奖励 */
const toSetReward = async () => {
  if (!walletAccount.value) return proxy.$showToast("请链接钱包");
  if (!inputVal2.value || !inputVal3.value) return proxy.$showToast("请输入");
  if (inputVal2.value > 100 || inputVal3.value > 100)
    return proxy.$showToast("最大值为100");
  proxy.$showLoadingToast({});
  try {
    const tx = await planetPool()
      .connect(getSigner())
      .setData(
        [inputVal2.value * 100, inputVal3.value * 100],
        [100000000000000, 28800],
        432000
      );
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      inputVal2.value = null;
      inputVal3.value = null;
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
/**调整L3星球价格 */
const toSetL3Price = async () => {
  if (!walletAccount.value) return proxy.$showToast("请链接钱包");
  if (!inputVal4.value) return proxy.$showToast("请输入");
  proxy.$showLoadingToast({});
  try {
    const tx = await scpBox()
      .connect(getSigner())
      .setBoxInfo(1, util.parseUnits(inputVal4.value.toString()), token().L3, [
        0,
        10000,
        0,
        0,
        0,
        0,
        0
      ]);
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      getL3Price();
      inputVal4.value = null;
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
const getBalancePlanetPool = async () => {
  inputNum1.value = null;
  const balance = await erc20(token().SCT).balanceOf(contract().PlanetPool);
  balancePlanetPool.value = proxy.$utils.utilFormat(util.formatEther(balance));
  console.log("PlanetPool", balancePlanetPool.value);
};
const getBalanceSCPBox = async () => {
  inputNum2.value = null;
  const balance = await erc20(token().SCT).balanceOf(contract().SCPBox);
  balanceSCPBox.value = proxy.$utils.utilFormat(util.formatEther(balance));
  console.log("SCPBox", balanceSCPBox.value);
};
const getBalanceL3 = async () => {
  inputNum2.value = null;
  const balance = await erc20(token().L3).balanceOf(contract().SCPBox);
  balanceL3.value = proxy.$utils.utilFormat(util.formatEther(balance));
  console.log("L3", balanceL3.value);
};
const getBalanceSCFBox = async () => {
  inputNum2.value = null;
  const balance = await erc20(token().SCT).balanceOf(contract().SCFBox);
  balanceSCFBox.value = proxy.$utils.utilFormat(util.formatEther(balance));
  console.log("SCFBox", balanceSCFBox.value);
};
const getBalanceShop = async () => {
  inputNum4.value = null;
  const balance = await erc20(token().SCT).balanceOf(contract().Shop);
  balanceShop.value = proxy.$utils.utilFormat(util.formatEther(balance));
  console.log("Shop", balanceShop.value);
};

const toClaimPlanetPool = async () => {
  if (!inputAddr1.value) return proxy.$showToast("请输入地址");
  if (!inputNum1.value) return proxy.$showToast("请输入数量");
  if (inputNum1.value > balancePlanetPool.value)
    return proxy.$showToast("不能超过当前余额");
  proxy.$showLoadingToast({});
  try {
    const tx = await planetPool()
      .connect(getSigner())
      .claimToken(
        token().SCT,
        inputAddr1.value,
        util.parseUnits(inputNum1.value.toString())
      );
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      getBalancePlanetPool();
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
const toClaimSCPBox = async () => {
  if (!inputAddr2.value) return proxy.$showToast("请输入地址");
  if (!inputNum2.value) return proxy.$showToast("请输入数量");
  if (inputNum2.value > balanceSCPBox.value)
    return proxy.$showToast("不能超过当前余额");
  proxy.$showLoadingToast({});
  try {
    const tx = await scpBox()
      .connect(getSigner())
      .claimToken(
        token().SCT,
        inputAddr2.value,
        util.parseUnits(inputNum2.value.toString())
      );
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      getBalanceSCPBox();
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
const toClaimL3 = async () => {
  if (!inputAddr5.value) return proxy.$showToast("请输入地址");
  if (!inputNum5.value) return proxy.$showToast("请输入数量");
  if (inputNum5.value > balanceL3.value)
    return proxy.$showToast("不能超过当前余额");
  proxy.$showLoadingToast({});
  try {
    const tx = await scpBox()
      .connect(getSigner())
      .claimToken(
        token().L3,
        inputAddr5.value,
        util.parseUnits(inputNum5.value.toString())
      );
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      getBalanceL3();
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
const toClaimSCFBox = async () => {
  if (!inputAddr3.value) return proxy.$showToast("请输入地址");
  if (!inputNum3.value) return proxy.$showToast("请输入数量");
  if (inputNum3.value > balanceSCFBox.value)
    return proxy.$showToast("不能超过当前余额");
  proxy.$showLoadingToast({});
  try {
    const tx = await scfBox()
      .connect(getSigner())
      .claimToken(
        token().SCT,
        inputAddr3.value,
        util.parseUnits(inputNum3.value.toString())
      );
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      getBalanceSCFBox();
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
const toClaimShop = async () => {
  if (!inputAddr4.value) return proxy.$showToast("请输入地址");
  if (!inputNum4.value) return proxy.$showToast("请输入数量");
  if (inputNum4.value > balanceShop.value)
    return proxy.$showToast("不能超过当前余额");
  proxy.$showLoadingToast({});
  try {
    const tx = await shop()
      .connect(getSigner())
      .claimToken(
        token().SCT,
        inputAddr4.value,
        util.parseUnits(inputNum4.value.toString())
      );
    await tx.wait();
    proxy.$showSuccessToast();
    setTimeout(() => {
      getBalanceShop();
    }, 500);
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};

const onConfirm = ({ selectedOptions }) => {
  showPicker.value = false;
  fieldValue.value = selectedOptions[0].text;
  fieldValueUse.value = selectedOptions[0].value;
};

const toSetShop = async () => {
  if (!fieldValueUse.value) return proxy.$showToast("请选择燃料");
  if (!inputAddr6.value) return proxy.$showToast("请输入设置购买燃料标的");
  if (!inputPrice.value) return proxy.$showToast("请输入标的购买价格");
  proxy.$showLoadingToast({});
  console.log("params1: ", fieldValueUse.value);
  console.log("params2: ", inputAddr6.value);
  console.log(
    "params3: ",
    inputPrice.value,
    util.parseUnits(inputPrice.value.toString())
  );
  try {
    const tx = await shop()
      .connect(getSigner())
      .setGoodsInfo(
        fieldValueUse.value,
        inputAddr6.value,
        util.parseUnits(inputPrice.value.toString())
      );
    await tx.wait();
    proxy.$showSuccessToast();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
const toAdd = async () => {
  if (!inputAddr7.value) return proxy.$showToast("请输入添加地址");
  proxy.$showLoadingToast({});
  try {
    const inviteContract = ContractConnect(FILWT, getSigner(), filwtAbi);
    const tx = await inviteContract.addToBlacklist(inputAddr7.value);
    await tx.wait();
    proxy.$showSuccessToast();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
const toRemove = async () => {
  if (!inputAddr8.value) return proxy.$showToast("请输入移除地址");
  proxy.$showLoadingToast({});
  try {
    const inviteContract = ContractConnect(FILWT, getSigner(), filwtAbi);
    const tx = await inviteContract.addToBlacklist(inputAddr8.value);
    await tx.wait();
    proxy.$showSuccessToast();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};

const isTeamManagerRole = () => {
  return manageList.value.includes(walletAccount.value);
};
const setTreasury = async () => {
  if (!isTeamManagerRole()) {
    proxy.$showFailToast("不是管理员");
    return;
  }

  if (!inputTreasury.value) return proxy.$showToast("请输入地址");
  proxy.$showLoadingToast({});
  try {
    await teamDaoFactory.setTreasury(inputTreasury.value);
    proxy.$showSuccessToast();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};

// const setLeaderEffect = async (effect:boolean)=>{
//   if(!inputLeaderEffect.value) return proxy.$showToast('请输入地址');
//   proxy.$showLoadingToast({});
//   try {
//     await teamDaoFactory.setLeaderEffect(inputLeaderEffect.value,effect);
//     proxy.$showSuccessToast();
//   } catch (err) {
//     console.error(err);
//     proxy.$closeToast();
//   }
// }

const setCurrentLeaderID = async () => {
  // if (!isTeamManagerRole()) {
  //   proxy.$showFailToast("不是管理员");
  //   return;
  // }
  if (!inputStartId.value) return proxy.$showToast("请输入超始 ID");
  proxy.$showLoadingToast({});
  try {
    await teamDaoFactory.setCurrentLeaderID(inputStartId.value);
    proxy.$showSuccessToast();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};

const onceBindRewardSct = ref("0");

const getOnceBindRewardSct = async () => {
  const res = await teamDaoFactory.getOnceBindRewardSct();
  onceBindRewardSct.value = new BigNumber(res.toString())
    .dividedBy(new BigNumber("10").pow(18))
    .toString();
};

const setOnceBindRewardSct = async () => {
  if (!isTeamManagerRole()) {
    proxy.$showFailToast("不是管理员");
    return;
  }
  if (!inputOnceBindRewardSct.value) return proxy.$showToast("请输入Sct数量");
  proxy.$showLoadingToast({});
  try {
    const value = new BigNumber(inputOnceBindRewardSct.value.toString())
      .multipliedBy(new BigNumber("10").pow(18))
      .toString();
    const tx = await teamDaoFactory.setOnceBindRewardSct(value);
    await tx.wait();
    await getOnceBindRewardSct();
    await store.dispatch("getTeamDao");

    proxy.$showSuccessToast();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};

const bindUsdtAmount = ref("0");

const getBindUdstAmount = async () => {
  const res = await teamDaoFactory.getBindUsdtAmount();
  console.log(res, res.toString(), "bindUdstAmount");
  bindUsdtAmount.value = new BigNumber(res.toString())
    .dividedBy(new BigNumber("10").pow(18))
    .toString();
};
const setBindUsdtAmount = async () => {
  if (!isTeamManagerRole()) {
    proxy.$showFailToast("不是管理员");
    return;
  }
  if (!inputBindUsdtAmount.value)
    return proxy.$showToast("请输入购买星球花费金额");
  proxy.$showLoadingToast({});
  try {
    const value = new BigNumber(inputBindUsdtAmount.value.toString())
      .multipliedBy(new BigNumber("10").pow(18))
      .toString();
    console.log(value, "value");
    const tx = await teamDaoFactory.setBindUsdtAmount(value);
    await tx.wait();
    await getBindUdstAmount();
    await store.dispatch("getTeamDao");
    proxy.$showSuccessToast();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};

const claimToken = async () => {
  if (!inputclaimTokenAddress.value) return proxy.$showToast("请输入Token地址");
  if (!inputclaimEOAAddress.value) return proxy.$showToast("请输入提取地址");
  if (!inputclaimToken.value) return proxy.$showToast("请输入提取余额");
  proxy.$showLoadingToast({});
  try {
    await teamDaoFactory.claimToken(
      inputclaimTokenAddress.value,
      inputclaimEOAAddress.value,
      new BigNumber(inputclaimToken.value)
        .multipliedBy(new BigNumber("10").pow(18))
        .toString()
    );
    proxy.$showSuccessToast();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};

const handlerManage = async () => {
  if (!adminList.value.includes(walletAccount.value)) {
    proxy.$showFailToast("不是管理员");
    return;
  }
  if (!manager.value) return proxy.$showToast("请输入管理员地址");
  proxy.$showLoadingToast({});
  try {
    const tx = await teamDaoFactory.addManager(
      managerRole.value,
      manager.value
    );
    await tx.wait();
    proxy.$showSuccessToast();
    await getAdminAndManagerList();
  } catch (err) {
    console.error(err);
    proxy.$closeToast();
  }
};
</script>

<style lang="scss" scoped>
.container2 {
  padding: 15px;
  h2,
  h4,
  > div {
    margin-bottom: 10px;
  }
}
.inputbox {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  input {
    width: calc(100% - 5em);
    height: 36px;
    line-height: 36px;
    background: #2a3042;
    box-shadow: 0 0 10px 0 rgba(77, 120, 255, 0.5);
    border-radius: 4px;
    border: 1px solid #fff;
    font-size: 16px;
    padding: 0 16px;
  }
}
.inputbtn {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
<style lang="scss">
.van-cell.van-field {
  background: #2a3042;
  box-shadow: 0 0 10px 0 rgba(77, 120, 255, 0.5);
  border-radius: 4px;
  border: 1px solid #fff;
}
.van-field__label {
  color: #fff;
  width: 2rem;
}
.van-cell.van-field .van-field__control {
  font-size: 15px;
}
.van-cell.van-field .van-field__control::placeholder {
  color: #757576;
}
</style>
