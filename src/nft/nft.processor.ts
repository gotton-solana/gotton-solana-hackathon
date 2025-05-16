import { Job } from 'bull';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { sleep } from '../utils/helpers/lib';
import { NftSolanaRewardData } from 'src/utils/interface';
import {
  QUEUE_NAME,
  QUEUE_REDIS_KEY,
  QUEUE_SLEEP_TIME,
  API_MAX_RETRY,
  API_TIMEOUT,
  QUEUE_MAX_RETRY,
  TRANSFER_TYPE,
  BACKEND_PATH,
} from 'src/utils/constants';
import _ from 'lodash';
import { Logger } from '@nestjs/common';
import { postWithRetry } from 'src/utils/helpers/api';
import { SolanaUtil } from '../utils/helpers/blockchain/solana';

@Processor(QUEUE_NAME.NFT_REWARD)
export class NftProcessor {
  private readonly logger = new Logger(NftProcessor.name);

  constructor(private readonly configService: ConfigService) {}

  @OnQueueActive()
  onActive(job: Job) {
    const data = _.cloneDeep(job.data);
    data.privateKey = null;
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        data,
      )}...`,
    );
  }
  /**
   * Handles the Solana NFT transfer job from the queue
   *
   * This processor executes the NFT transfer on Solana blockchain and notifies
   * the Java backend about the transfer result. It includes retry logic for
   * failed transfers up to the configured maximum retry count.
   *
   * @param {Job} job - The job object containing NFT transfer data
   * @returns {Promise<void>}
   * @throws {Error} If there's an issue with the transfer after all retries
   */
  @Process(QUEUE_REDIS_KEY.NFT_SOLANA_REWARD)
  async handleSendNftSolanaReward(job: Job) {
    const data: NftSolanaRewardData = job.data;
    try {
      this.logger.log('Start transfer nft Solana ...');
      const solanaUtil = new SolanaUtil(this.configService);
      const result = await solanaUtil.transferFungibleAssetToken(
        data.mintAddress,
        data.privateKey,
        data.toWalletAddress,
        data.amount,
      );
      data.txHash = result.signature;
      await job.update(data);
      this.logger.log('End transfer nft Solana ...');

      const webhookData: {
        nftType: string;
        amount: number;
        nftAddress: string;
        tokenId: number;
        chainId: number;
        success: boolean;
        transferType: string;
        sentAddress: string;
        transactionHash: string;
        prizeNftFreePlayId: string;
      } = {
        chainId: 6869,
        nftAddress: data.mintAddress,
        nftType: 'TOKEN_PROGRAM_ID',
        sentAddress: data.toWalletAddress,
        amount: data.amount,
        tokenId: 1,
        success: true,
        transactionHash: data.txHash,
        prizeNftFreePlayId: data.prizeNftFreePlayId,
        transferType: TRANSFER_TYPE.TRANSFER_NFT_PRIZE_FREE_PLAY,
      };

      console.log(
        `${this.configService.get('JAVA_BACKEND_URL')}/${
          BACKEND_PATH.CONFIRM_TRANSFER_NFT_PRIZE
        }`,
      );

      console.log(webhookData);

      await postWithRetry(
        `${this.configService.get('JAVA_BACKEND_URL')}/${
          BACKEND_PATH.CONFIRM_TRANSFER_NFT_PRIZE
        }`,
        webhookData,
        API_MAX_RETRY,
        API_TIMEOUT,
      );

      this.logger.log(`End send reward nft to user, txHash:`, data.txHash);
    } catch (error) {
      this.logger.log({ error });
      await sleep(QUEUE_SLEEP_TIME);

      if (job.attemptsMade === QUEUE_MAX_RETRY - 1) {
        const webhookData: {
          nftType: string;
          amount: number;
          nftAddress: string;
          tokenId: number;
          chainId: number;
          success: boolean;
          transferType: string;
          sentAddress: string;
          transactionHash: null;
          prizeNftFreePlayId: string;
        } = {
          chainId: 6869,
          nftAddress: data.mintAddress,
          nftType: 'TOKEN_PROGRAM_ID',
          sentAddress: data.toWalletAddress,
          amount: data.amount,
          tokenId: 1,
          success: false,
          transactionHash: null,
          prizeNftFreePlayId: data.prizeNftFreePlayId,
          transferType: TRANSFER_TYPE.TRANSFER_NFT_PRIZE_FREE_PLAY,
        };
        await postWithRetry(
          `${this.configService.get('JAVA_BACKEND_URL')}/${
            BACKEND_PATH.CONFIRM_TRANSFER_NFT_PRIZE
          }`,
          webhookData,
          API_MAX_RETRY,
          API_TIMEOUT,
        );
      } else {
        await job.retry();
      }
    }
  }
}
