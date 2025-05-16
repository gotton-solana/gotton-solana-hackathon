import { Controller, Post, Body, UsePipes, UseGuards } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { NftService } from './nft.service';
import { AppAuthGuard } from '../auth/guards/app-auth.guard';
import { MainValidationPipe } from 'src/pipes/validation.pipe';
import { SendNftSolanaRewardDto } from './dto/send-nft-solana-reward-dto';

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}
  /**
   * Transfer NFT reward on Solana blockchain
   *
   * This endpoint handles transferring NFT tokens from one wallet to another on the Solana blockchain.
   * The request must be authenticated, and the user must have proper permissions.
   *
   * @param {SendNftSolanaRewardDto} sendNftSolanaRewardDto - The DTO containing information needed for NFT transfer
   * @returns {Promise<any>} The result of the NFT transfer operation
   */
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @UsePipes(new MainValidationPipe())
  @UseGuards(AppAuthGuard)
  @ApiOkResponse()
  @ApiBadGatewayResponse()
  @Post('solana/transfer-nft')
  sendNftSolanaReward(@Body() sendNftSolanaRewardDto: SendNftSolanaRewardDto) {
    return this.nftService.sendNftSolanaReward(sendNftSolanaRewardDto);
  }
}
