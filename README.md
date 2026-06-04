# NFTWU

> 一个基于 Scaffold-ETH 2 构建的 Web3 NFT 应用，集成 NFT 铸造、批量空投、IPFS 元数据管理、Marketplace 交易、报价系统与盲拍机制，并扩展了内容展示型首页。

## 项目亮点

- 支持单个铸造、自定义铸造、批量铸造和 Excel 批量导入
- 支持 NFT 上架、购买、取消、改价、报价、接受报价
- 支持 Commit-Reveal 模式的盲拍流程
- 集成 IPFS 图片与元数据上传、查询能力
- 基于 Next.js + Hardhat + Wagmi + RainbowKit 构建完整 dApp

## 功能概览

| 模块 | 功能 | 说明 |
| --- | --- | --- |
| NFT 铸造 | 预设铸造 | 使用预置元数据直接生成 NFT |
| NFT 铸造 | 自定义铸造 | 自定义图片或元数据进行铸造 |
| NFT 铸造 | 批量铸造 | 一次性生成多个 NFT |
| NFT 铸造 | Excel 导入 | 按模板导入数据进行批量铸造 |
| NFT 铸造 | 空投 | 批量向多个地址发送 NFT |
| NFT 管理 | 我的 NFT | 查看当前钱包持有的 NFT |
| NFT 管理 | 我的挂单 | 查看当前地址发布的市场挂单 |
| 市场交易 | 上架 / 购买 | 完成基础 NFT 交易流程 |
| 市场交易 | 改价 / 取消 | 管理已上架 NFT |
| 市场交易 | 报价系统 | 买家发起报价，卖家接受报价 |
| 盲拍 | Commit-Reveal | 支持提交承诺、揭示出价、拍卖结算 |
| IPFS | 上传图片 / 元数据 | 生成并保存 NFT 元数据 |
| 数据展示 | 转账记录 / 区块浏览 | 辅助调试和链上信息查看 |

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 前端 | Next.js 15, React 19, TypeScript |
| Web3 | Wagmi, Viem, RainbowKit |
| 合约开发 | Hardhat, Solidity, OpenZeppelin |
| 工程基础 | Scaffold-ETH 2, Yarn Workspaces |
| 存储 | IPFS |

## 快速开始

### 环境要求

- Node.js >= 20.18.3
- Yarn 3.2.3
- Git

### 安装依赖

在项目根目录执行：

```bash
yarn install
```

### 本地启动

按以下顺序分别在 3 个终端中执行：

1. 启动本地区块链

```bash
yarn chain
```

2. 部署合约

```bash
yarn deploy
```

3. 启动前端

```bash
yarn start
```

启动成功后访问：

```text
http://localhost:3000
```

## 常用命令

```bash
yarn install
yarn chain
yarn deploy
yarn start
yarn compile
yarn test
yarn lint
yarn format
yarn generate
yarn account
yarn verify --network sepolia
```

## 部署说明

### 本地部署

用于本地开发和联调：

```bash
yarn chain
yarn deploy
yarn start
```

### 部署到 Sepolia

1. 在 `packages/hardhat/.env` 中配置部署账户和 RPC 所需环境变量
2. 确保部署账户有足够的测试 ETH
3. 执行部署命令：

```bash
yarn deploy --network sepolia
```

4. 如需验证合约：

```bash
yarn verify --network sepolia
```

### 部署前端

如果需要部署到 Vercel，可在项目根目录执行：

```bash
yarn vercel
```

首次使用可先登录：

```bash
yarn vercel:login
```

## 项目结构

```text
nftwu/
├─ package.json
├─ yarn.lock
├─ packages/
│  ├─ hardhat/
│  │  ├─ contracts/
│  │  │  ├─ YourCollectible.sol
│  │  │  └─ NFTMarketplace.sol
│  │  ├─ deploy/
│  │  ├─ scripts/
│  │  └─ test/
│  └─ nextjs/
│     ├─ app/
│     │  ├─ myNFTs/
│     │  ├─ marketplace/
│     │  ├─ blind-auctions/
│     │  ├─ transfers/
│     │  ├─ ipfsUpload/
│     │  ├─ ipfsDownload/
│     │  ├─ debug/
│     │  └─ api/
│     ├─ components/
│     ├─ hooks/
│     ├─ services/
│     ├─ utils/
│     └─ public/
```

## 核心合约

### YourCollectible

NFT 合约，主要提供：

- `mintItem(address to, string memory uri)`：铸造单个 NFT
- `airdropMint(address[] memory recipients, string memory uri)`：批量空投 NFT
- 基于 `ERC721Enumerable` 的可枚举能力
- 基于 `ERC721URIStorage` 的 Token URI 管理

### NFTMarketplace

市场合约，主要提供：

- `listNFT`：上架 NFT
- `buyNFT`：购买 NFT
- `cancelListing`：取消挂单
- `pauseListing` / `resumeListing`：暂停和恢复挂单
- `updatePrice`：修改挂单价格
- `makeOffer` / `cancelOffer` / `acceptOffer`：报价系统
- `createBlindAuction` / `commitBlindBid` / `revealBlindBid` / `finalizeBlindAuction`：盲拍流程

## 页面导航

| 路由 | 说明 |
| --- | --- |
| `/` | 首页展示与快捷入口 |
| `/myNFTs` | 铸造、批量铸造、空投、我的 NFT |
| `/marketplace` | NFT 市场 |
| `/blind-auctions` | 盲拍页面 |
| `/transfers` | NFT 转账事件查看 |
| `/ipfsUpload` | 上传图片和元数据到 IPFS |
| `/ipfsDownload` | 查询和下载 IPFS 元数据 |
| `/debug` | 合约调试页 |
| `/blockexplorer` | 本地区块浏览器 |

## 环境变量

### Hardhat

文件位置：

```text
packages/hardhat/.env
```

常用变量：

- `DEPLOYER_PRIVATE_KEY`
- `ALCHEMY_API_KEY`
- `ETHERSCAN_API_KEY`

### Next.js

文件位置：

```text
packages/nextjs/.env.local
```

## 打包与恢复运行

如果压缩前删除了以下目录：

- `node_modules`
- `packages/nextjs/node_modules`
- `packages/hardhat/node_modules`
- `.next`
- `artifacts`
- `cache`
- `typechain-types`

解压后按以下步骤恢复：

```bash
yarn install
```

```bash
yarn chain
```

```bash
yarn deploy
```

```bash
yarn start
```

## 后续计划

- 增加真实 NFT 资源模板和封面图
- 增强市场筛选、排序和搜索
- 增加用户主页、收藏与历史记录
- 优化盲拍交互和状态提示
- 完成测试网和线上部署

## 作者信息

| 项目 | 内容 |
| --- | --- |
| 作者 | 待补充 |
| 邮箱 | 待补充 |
| GitHub | 待补充 |
| 项目类型 | Web3 NFT dApp |

> 可将上面的“待补充”替换为你的真实信息，作为 GitHub 仓库首页展示。

## 致谢

本项目基于 Scaffold-ETH 2 进行开发，结合 Hardhat、Next.js 与常见 Web3 工具链实现。
