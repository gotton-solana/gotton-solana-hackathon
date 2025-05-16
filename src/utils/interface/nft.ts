export interface NftRewardData {
  chainId: number;
  nftAddress: string;
  nftType: string;
  receiver: string;
  amount: number;
  tokenId: string;
  privateKey: string;
  txHash: string;
}

export interface NftData {
  privateKey: string;
  chainId: string;
  tokenId: string;
  nftContract: string;
  nftType: string;
  receiver: string;
  amount: number;
  txHash: string;
}

export interface GetNftData {
  chainId: string;
  latestBlock: number;
  isProcessing: boolean;
  address: string;
}

export interface NftAddressItem {
  address: string;
  type: number;
}

export interface SyncNftDataItem {
  chain_id: string;
  contract_address: string;
  token_id: string;
  nft_type: string;
  value: string;
  token_uri: string;
  image: string;
  name: string;
  description: string;
}

export interface SendNftWebHookData {
  chainId: number;
  nftAddress: string;
  nftType: string;
  sentAddress: string;
  amount: number;
  tokenId: string;
  success: boolean;
  transactionHash: string;
  transferType: string;
}

export interface NftSolanaRewardData {
  mintAddress: string;
  toWalletAddress: string;
  amount: number;
  prizeNftFreePlayId: string;
  privateKey: string;
  txHash: string;
}
