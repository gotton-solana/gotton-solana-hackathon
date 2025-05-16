import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { JOB_SCHEDULE_DEFAULT } from 'src/utils/constants';
import { CronJob } from 'cron';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { QUEUE_NAME, QUEUE_REDIS_KEY } from 'src/utils/constants';
import { SolanaUtil } from '../utils/helpers/blockchain/solana';

@Injectable()
export class TasksService implements OnModuleInit {
  private env: string;

  constructor(
    private readonly config: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    @InjectQueue(QUEUE_NAME.GET_NFT) private readonly queue: Queue,
  ) {
    this.env = this.config.get('NODE_ENV');
  }

  async onModuleInit() {
    const enableTask = this.config.get('ENABLE_TASK') ?? '';
    if (enableTask !== 'true') {
      console.log('Disable run task');
      return;
    }

    this.addCronJob(
      'scanBlock',
      this.config.get('GET_NFT_JOB_SCHEDULE') || JOB_SCHEDULE_DEFAULT.GET_NFT,
      this.handleGetNftSolanaCron.bind(this),
    );

    const processingJobKeySolana = `${QUEUE_REDIS_KEY.GET_NFT_SOLANA}_processing`;
    const jobSolana = await this.queue.getJob(processingJobKeySolana);

    if (jobSolana) {
      await jobSolana.update(false);
    }
  }

  addCronJob(
    name: string,
    cronExpression: string,
    callback: () => Promise<void>,
  ) {
    const job = new CronJob(
      cronExpression,
      () => {
        callback();
      },
      null,
      false,
    );

    this.schedulerRegistry.addCronJob(name, job);
    job.start();
  }

  /**
   * Processes Solana NFTs/tokens in a scheduled cron job.
   * This method retrieves metadata and balance information for multiple token mint addresses.
   * To prevent concurrent processing, it uses a Redis queue for job tracking.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the cron job completes
   */
  async handleGetNftSolanaCron() {
    // Check if there's already a job in progress using Redis
    const processingJobKey = `${QUEUE_REDIS_KEY.GET_NFT_SOLANA}_processing`;
    let processingJob = await this.queue.getJob(processingJobKey);
    if (processingJob && processingJob.data) {
      console.log('Processing ...');
      return;
    }

    try {
      console.log('Start get NFT Solana ...');
      // Create or update the processing job in the queue
      if (processingJob) {
        await processingJob.update(true);
      } else {
        processingJob = await this.queue.add(processingJobKey, true, {
          jobId: processingJobKey,
        });
      }

      // Initialize Solana utilities
      const solanaUtil = new SolanaUtil(this.config);

      // Get token mint addresses from configuration
      const mintAddressesString = this.config.get<string>(
        'TOKEN_MINT_ADDRESSES',
        '',
      );
      const batchSize = 5; // Process tokens in batches of 5
      const mintAddresses = mintAddressesString
        .split(',')
        .filter((addr) => addr.trim() !== '');

      // Store results for all processed tokens
      const results = [];

      // Process tokens in batches to avoid overloading the RPC endpoint
      for (let i = 0; i < mintAddresses.length; i += batchSize) {
        const batch = mintAddresses.slice(i, i + batchSize);
        console.log(
          `Processing batch ${i / batchSize + 1} (${batch.length} tokens)...`,
        );

        // Process each token in the current batch concurrently
        const batchResults = await Promise.all(
          batch.map(async (mintAddress) => {
            try {
              // Get token metadata and balance information
              const result = await solanaUtil.getTokenBalanceAndMetadata(
                mintAddress.trim(),
              );

              return {
                ...result,
              };
            } catch (error) {
              // Handle and record any errors for individual tokens
              return {
                mintAddress: mintAddress.trim(),
                error: error.message || 'Unknown error',
              };
            }
          }),
        );

        // Add batch results to the overall results array
        results.push(...batchResults);

        // Add a small delay between batches to prevent rate limiting
        if (i + batchSize < mintAddresses.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      console.log({ results });
    } catch (error) {
      // Log any overall job errors
      console.log({ error });
    } finally {
      // Mark the job as complete regardless of success or failure
      console.log('End get NFT Solana !!!');
      await processingJob.update(false);
    }
  }
}
