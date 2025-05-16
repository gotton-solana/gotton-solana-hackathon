import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { IsBigNumber } from '../nft.decorator';

/**
 * Data Transfer Object for sending NFT rewards on Solana blockchain
 *
 * This DTO validates and structures the data required for transferring NFT tokens
 * from a service wallet to a user's wallet on the Solana blockchain.
 */
export class SendNftSolanaRewardDto {
  /**
   * The mint address of the NFT token to be transferred
   *
   * @example "J853GmGJRoLSYCzr8SQHp7wAuGzNCV3CEHbQ8ojUzRJf"
   */
  @ApiProperty({ description: 'NFT contract address' })
  @Type(() => String)
  @IsNotEmpty()
  mintAddress: string;

  /**
   * The wallet address of the recipient who will receive the NFT
   *
   * @example "3PbQFYu9rKBBtPYbqnrLz7hjKYhKNwrcmpvsX344h9YC"
   */
  @ApiProperty({ description: 'The address of receiver.' })
  @Type(() => String)
  @IsNotEmpty()
  toWalletAddress: string;

  /**
   * The amount of NFT tokens to transfer
   *
   * For non-fungible tokens, this is typically 1
   * For semi-fungible or fungible tokens, this can be any positive number
   *
   * @example 1
   */
  @ApiProperty({ description: 'amount of NFT.' })
  @Type(() => Number)
  @IsBigNumber()
  amount: number;

  /**
   * Prize Nft Free Play.
   */
  @ApiProperty({ description: 'Id Prize Nft Free Play.' })
  @Type(() => String)
  @IsNotEmpty()
  prizeNftFreePlayId: string;
}
