import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import {
  QUEUE_MAX_RETRY,
  QUEUE_NAME,
  QUEUE_REDIS_KEY,
} from 'src/utils/constants';
import { decryptData } from 'src/utils/helpers/crypto';
import { SendNftSolanaRewardDto } from './dto/send-nft-solana-reward-dto';

@Injectable()
export class NftService {
  private privateKey: string;

  private privateKeySolana: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue(QUEUE_NAME.NFT_REWARD) private readonly nftQueue: Queue,
  ) {
    this.privateKeySolana = decryptData(
      this.configService.get('ADMIN_PRIVATE_KEY_SOLANA'),
      this.configService.get('SECRET_KEY'),
      this.configService.get('SECRET_IV'),
    );
  }
  /**
   * Sends an NFT reward on Solana blockchain by adding it to a processing queue
   *
   * This method queues an NFT transfer operation to be processed asynchronously.
   * It adds the transfer request to a queue with the private key required for transaction signing.
   *
   * @param {SendNftSolanaRewardDto} sendNftSolanaRewardDto - The data transfer object containing NFT transfer details
   * @returns {Promise<boolean>} Returns true when the request is successfully queued
   * @throws {Error} If there's an issue adding the job to the queue
   */
  async sendNftSolanaReward(sendNftSolanaRewardDto: SendNftSolanaRewardDto) {
    const queueData = {
      ...sendNftSolanaRewardDto,
      privateKey: this.privateKeySolana,
      txHash: null,
    };
    await this.nftQueue.add(QUEUE_REDIS_KEY.NFT_SOLANA_REWARD, queueData, {
      attempts: QUEUE_MAX_RETRY,
    });

    return true;
  }
}
