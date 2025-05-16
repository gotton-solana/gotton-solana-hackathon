export const QUEUE_NAME = {
  NFT_REWARD: 'nft-reward-queue',
  SEND_NFT: 'send-nft-queue',
  GET_NFT: 'get-nft-queue',
};

export const QUEUE_REDIS_KEY = {
  NFT_REWARD: 'polygon_redis_key_reward',
  NFT_SOLANA_REWARD: 'solana_redis_key_reward',
  SEND_NFT: 'redis_key_send_nft',
  GET_NFT: 'redis_key_get_nft',
  GET_NFT_SOLANA: 'redis_key_get_nft_solana',
};

export const QUEUE_SLEEP_TIME = 2000; // 2s

export const QUEUE_MAX_RETRY = 5;
