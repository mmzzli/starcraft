import { ContractConnect } from "@/constants/sdk/index";
import abi from "@/abis/TeamDao.json";
import erc20Abi from "@/abis/erc20.json";
import { contract, erc20, getSigner, token } from "@/utils";
import walletUtils from "@/globalUtil/walletUtils";
import { constants } from "ethers";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

export const teamDaoContract = ContractConnect(
  contract().TEAM_DAO,
  getSigner(),
  abi.abi
);
export const usdtContract = ContractConnect(
  token().USDT,
  getSigner(),
  erc20Abi
);

export class TeamDaoFactory {
  private teamDaoContract = teamDaoContract;

  // 查看 teamLeader信息
  async teamLeaderInfo(address: string) {
    return await this.teamDaoContract.leaders(address);
  }

  // 检查授权
  async checkApprove(token: string, contract: string, balance: any) {
    return walletUtils.checkApprove(token, contract, balance);
  }

  // 查看注册资格(持有正在正常挖矿的星球才可以参加)
  async canRegisterTeamLeader() {
    return this.teamDaoContract.viewCanRegisterTeamLeader();
  }

  // 查看注册团队需要质押的金额
  getStakeAmount() {
    return this.teamDaoContract.minStakeAmount();
  }

  // USDT 授权
  async setApprove(contract: string) {
    return erc20(token().USDT)
      .connect(getSigner())
      .approve(contract, constants.MaxUint256);
  }

  // 注册团队长
  async registerTeamLeader() {
    return ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    ).registerTeamLeader();
  }

  // 激活
  async activateInviter(address: string) {
    return ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    ).activateInviter(address);
  }

  // 确认接受
  async bindInviter(address: string) {
    return ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    ).bindInviter(address, { gasLimit: 1000000 });
  }

  // 退出质押保证金
  async unStake() {
    return ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    ).quitRegister({ gasLimit: 1000000 });
  }

  // 领取红利
  async withDrawReward() {
    return ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    ).withdrawReward({ gasLimit: 1000000 });
  }
  // 查看用户地址否绑定邀请人
  async users(address: string) {
    return this.teamDaoContract.users(address);
  }

  //     查看成员授权的 USDT 数量
  async getNeedTeamItemUsdtNum() {
    return this.teamDaoContract.bindUsdtAmount();
  }
  // 查看当前地址的邀请人
  async getTeamLeaderAddress(address: string) {
    return this.teamDaoContract.getTeamLeader(address);
  }

  // setTreasury 设置收款人
  async setTreasury(address: string) {
    return this.teamDaoContract.setTreasury(address);
  }

  // setLeaderEffect 封禁解封团队长
  async setLeaderEffect(address: string, effect: boolean) {
    return this.teamDaoContract.setLeaderEffect(address, effect);
  }

  // setCurrentLeaderID 设置团队长起始id
  async setCurrentLeaderID(id: number) {
    console.log(id, "========");
    const contractWithSigner = ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    );
    return contractWithSigner.setCurrentLeaderID(id, { gasLimit: 1000000 });
  }

  //  设置单次解锁sct数量
  async setOnceBindRewardSct(number: number | string) {
    const contractWithSigner = ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    );
    return contractWithSigner.setOnceBindRewardSct(number, {
      gasLimit: 1000000
    });
  }

  async getOnceBindRewardSct() {
    return this.teamDaoContract.onceBindRewardSct();
  }

  //  设置邀请购买星球花费金额
  async setBindUsdtAmount(number: string) {
    const contractWithSigner = ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    );
    return contractWithSigner.setBindUsdtAmount(number);
  }

  async getBindUsdtAmount() {
    return this.teamDaoContract.bindUsdtAmount();
  }

  //  提取余额
  async claimToken(tokenAddress: string, eoaAddress: string, amount: string) {
    const contractWithSigner = ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    );
    return contractWithSigner.claimToken(tokenAddress, eoaAddress, amount, {
      gasLimit: 1000000
    });
  }

  async getAdminRole() {
    return this.teamDaoContract.DEFAULT_ADMIN_ROLE();
  }
  // 获取管理员hash串，用于获取管理员数量
  async managerRole() {
    return this.teamDaoContract.MANAGER_ROLE();
  }

  // 获取管理员数量
  async getRoleCount(key) {
    return this.teamDaoContract.getRoleMemberCount(key);
  }
  async getAdminList() {
    const list: any[] = [];
    const key = await this.getAdminRole();
    console.log(key, "=====");

    const count = await this.getRoleCount(key);
    for (let i = 0; i < count; i++) {
      list[i] = await this.teamDaoContract.getRoleMember(key, i);
    }
    console.log(list, "adminlist");
    return list;
  }

  // 获取管理列表，根据管理员数量的下标获取管理员的列表
  async getManagerList() {
    const list: any[] = [];
    const key = await this.managerRole();
    const count = await this.getRoleCount(key);
    console.log(count, "count");
    for (let i = 0; i < count; i++) {
      list[i] = await this.teamDaoContract.getRoleMember(key, i);
    }
    console.log(list, "===getManagerList===");
    return list;
  }

  //   添加管理员
  async addManager(key: string, address: string) {
    // const key = await this.managerRole();
    // 每次调用时重新获取 signer
    const contractWithSigner = ContractConnect(
      contract().TEAM_DAO,
      getSigner(),
      abi.abi
    );
    return contractWithSigner.grantRole(key, address, { gasLimit: 1000000 });
  }

  //   当前 team起始 id
  async getCurTeamStartid() {
    return this.teamDaoContract;
  }
}

const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/84515/teamdao/version/latest",
  cache: new InMemoryCache()
});

export const teamDapApi = {
  getTeamNumber: async (address: string) => {
    console.log(address, "address");
    const teamNumberQuery = `
      query($address: String) {
        teamLeader(id: $address){
          id 
          members{
            id
          }
        }
        user(id: $address){
          reffers{
            id
            hasActived
          }
        }
      }
    `;
    return await client.query({
      query: gql(teamNumberQuery),
      variables: {
        address: address.toLowerCase()
      }
    });
  },
  getInviteActived: async (address: string) => {
    console.log(address, "address");
    const teamNumberQuery = `
      query($address: String) {
        user(id: $address){
          hasActived
        }
      }
    `;
    return await client.query({
      query: gql(teamNumberQuery),
      variables: {
        address: address.toLowerCase()
      }
    });
  }
};
