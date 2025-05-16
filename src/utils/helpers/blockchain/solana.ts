import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import bs58 from 'bs58';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Metaplex } from '@metaplex-foundation/js';
import { postWithRetry } from '../api';
import { API_MAX_RETRY, API_TIMEOUT, BACKEND_PATH } from '../../constants';
import { SyncNftDataItem } from '../../interface';

export class SolanaUtil {
  private connection: Connection;

  /**
   * Logger instance for tracking processing activities.
   */
  private readonly logger = new Logger(SolanaUtil.name);

  constructor(private readonly configService: ConfigService) {
    const solanaEndpoint = this.configService.get<string>(
      'SOLANA_RPC_ENDPOINT',
      'https://api.devnet.solana.com',
    );
    this.connection = new Connection(solanaEndpoint, 'confirmed');
  }

  /**
   * Convert private key to keypair
   * @param privateKey Private key of the sender's wallet
   * @returns Keypair from private key
   */
  getKeypairFromPrivateKey(privateKey) {
    try {
      const privateKeyArray = JSON.parse(privateKey);
      return Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    } catch (e) {
      this.logger.error('Not a JSON array, trying other formats...');
    }

    try {
      const secretKeyUint8 = Uint8Array.from(Buffer.from(privateKey, 'base64'));
      return Keypair.fromSecretKey(secretKeyUint8);
    } catch (e) {
      this.logger.error('Not a valid base64 format, trying next...');
    }

    if (bs58 && typeof bs58.decode === 'function') {
      try {
        const secretKey = bs58.decode(privateKey);
        return Keypair.fromSecretKey(secretKey);
      } catch (e) {
        this.logger.error('Not a valid bs58 format');
      }
    } else {
      this.logger.warn('bs58 decode function not available');
    }

    throw new Error('Private key could not be decoded in any supported format');
  }

  /**
   * Transfer NFT token from one wallet to another
   * @param mintAddress Mint address of the NFT
   * @param fromPrivateKey Private key of the sender's wallet
   * @param toWalletAddress Recipient's wallet address
   * @param amount Number of tokens to transfer
   * @returns Result information of the token transfer
   */
  async transferNftToken(
    mintAddress: string,
    fromPrivateKey: string | Uint8Array,
    toWalletAddress: string,
    amount: number,
  ) {
    try {
      const mint = new PublicKey(mintAddress);
      const toWallet = new PublicKey(toWalletAddress);

      const fromWallet = this.getKeypairFromPrivateKey(fromPrivateKey);
      this.logger.log(`Sender: ${fromWallet.publicKey.toString()}`);
      this.logger.log(`Recipient: ${toWallet.toString()}`);

      const fromTokenAccount = getAssociatedTokenAddressSync(
        mint,
        fromWallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      this.logger.log(
        `Checking sender's balance at: ${fromTokenAccount.toString()}`,
      );

      const fromAccountInfo = await this.connection.getAccountInfo(
        fromTokenAccount,
      );
      if (!fromAccountInfo) {
        throw new Error(
          `Sender does not have a token account for this NFT: ${mintAddress}`,
        );
      }

      // Get current balance of sender
      const fromTokenBalance = await this.connection.getTokenAccountBalance(
        fromTokenAccount,
      );
      this.logger.log(
        `Current balance of sender: ${fromTokenBalance.value.uiAmount}`,
      );

      if (fromTokenBalance.value.uiAmount < amount) {
        throw new Error(
          `Insufficient tokens for transfer. Required: ${amount}, Available: ${fromTokenBalance.value.uiAmount}`,
        );
      }

      const toTokenAccount = getAssociatedTokenAddressSync(
        mint,
        toWallet,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      this.logger.log(
        `Recipient's token account: ${toTokenAccount.toString()}`,
      );

      const toAccountInfo = await this.connection.getAccountInfo(
        toTokenAccount,
      );

      const transaction = new Transaction();

      // If recipient's token account doesn't exist, create it
      if (!toAccountInfo) {
        this.logger.log('Creating token account for recipient...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromWallet.publicKey, // payer
            toTokenAccount, // associated token account
            toWallet, // owner
            mint, // mint
            TOKEN_2022_PROGRAM_ID,
          ),
        );
      }

      // Add token transfer instruction
      transaction.add(
        createTransferInstruction(
          fromTokenAccount, // source
          toTokenAccount, // destination
          fromWallet.publicKey, // owner
          amount * Math.pow(10, fromTokenBalance.value.decimals), // amount, convert from UI amount to raw amount
          [], // multisig signers
          TOKEN_2022_PROGRAM_ID,
        ),
      );

      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromWallet],
        { commitment: 'confirmed', maxRetries: 5 },
      );

      this.logger.log(
        `Transferred ${amount} tokens from ${fromWallet.publicKey.toString()} to ${toWallet.toString()}`,
      );
      this.logger.log(`Transaction signature: ${signature}`);

      // Check balance after transfer
      const toTokenBalanceAfter = await this.connection.getTokenAccountBalance(
        toTokenAccount,
      );
      this.logger.log(
        `Recipient's balance after transfer: ${toTokenBalanceAfter.value.uiAmount}`,
      );

      return {
        success: true,
        signature,
        mint: mintAddress,
        from: fromWallet.publicKey.toString(),
        to: toWallet.toString(),
        amount,
        fromTokenAccount: fromTokenAccount.toString(),
        toTokenAccount: toTokenAccount.toString(),
      };
    } catch (error) {
      this.logger.error('Error transferring NFT token:', error);
      throw error;
    }
  }

  /**
   * Transfer FungibleAsset token from one wallet to another
   * @param mintAddress Mint address of the FungibleAsset
   * @param fromPrivateKey Private key of the sender's wallet
   * @param toWalletAddress Recipient's wallet address
   * @param amount Number of tokens to transfer
   * @returns Result information of the token transfer
   */
  async transferFungibleAssetToken(
    mintAddress: string,
    fromPrivateKey: string | Uint8Array,
    toWalletAddress: string,
    amount: number,
  ) {
    try {
      this.logger.log(`Checking sender's balance at}`);
      const mint = new PublicKey(mintAddress);
      const toWallet = new PublicKey(toWalletAddress);

      const fromWallet = this.getKeypairFromPrivateKey(fromPrivateKey);
      this.logger.log(`Sender: ${fromWallet.publicKey.toString()}`);
      this.logger.log(`Recipient: ${toWallet.toString()}`);

      // FungibleAsset tokens use regular Associated Token Accounts
      // but we need to be sure to use the standard SPL Token program ID
      const fromTokenAccount = getAssociatedTokenAddressSync(
        mint,
        fromWallet.publicKey,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID, // Using standard SPL token program ID for FungibleAsset
      );

      this.logger.log(
        `Checking sender's balance at: ${fromTokenAccount.toString()}`,
      );

      // Check if sender has a token account
      const fromAccountInfo = await this.connection.getAccountInfo(
        fromTokenAccount,
      );
      if (!fromAccountInfo) {
        throw new Error(
          `Sender does not have a token account for this FungibleAsset: ${mintAddress}`,
        );
      }

      // Get current balance of sender
      const fromTokenBalance = await this.connection.getTokenAccountBalance(
        fromTokenAccount,
      );
      this.logger.log(
        `Current balance of sender: ${fromTokenBalance.value.uiAmount}`,
      );

      // Check if sender has enough tokens
      if (fromTokenBalance.value.uiAmount < amount) {
        throw new Error(
          `Insufficient tokens for transfer. Required: ${amount}, Available: ${fromTokenBalance.value.uiAmount}`,
        );
      }

      // Generate recipient's token account address
      const toTokenAccount = getAssociatedTokenAddressSync(
        mint,
        toWallet,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID, // Using standard SPL token program ID for FungibleAsset
      );

      this.logger.log(
        `Recipient's token account: ${toTokenAccount.toString()}`,
      );

      // Check if recipient's token account exists
      const toAccountInfo = await this.connection.getAccountInfo(
        toTokenAccount,
      );

      // Create transaction
      const transaction = new Transaction();

      // If recipient's token account doesn't exist, create it
      if (!toAccountInfo) {
        this.logger.log('Creating token account for recipient...');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromWallet.publicKey, // payer
            toTokenAccount, // associated token account
            toWallet, // owner
            mint, // mint
            TOKEN_PROGRAM_ID, // Using standard SPL token program ID
          ),
        );
      }

      // For FungibleAsset with 0 decimals, we don't need to convert the amount
      // since the UI amount is the same as the raw amount
      // No conversion needed for 0 decimal tokens
      // Add token transfer instruction
      transaction.add(
        createTransferInstruction(
          fromTokenAccount, // source
          toTokenAccount, // destination
          fromWallet.publicKey, // owner
          amount, // amount (no conversion for 0 decimals)
          [], // multisig signers
          TOKEN_PROGRAM_ID, // Using standard SPL token program ID
        ),
      );

      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromWallet],
        { commitment: 'confirmed', maxRetries: 5 },
      );

      this.logger.log(
        `Transferred ${amount} FungibleAsset tokens from ${fromWallet.publicKey.toString()} to ${toWallet.toString()}`,
      );
      this.logger.log(`Transaction signature: ${signature}`);

      // Check balance after transfer
      const toTokenBalanceAfter = await this.connection.getTokenAccountBalance(
        toTokenAccount,
      );
      this.logger.log(
        `Recipient's balance after transfer: ${toTokenBalanceAfter.value.uiAmount}`,
      );

      // Check sender's remaining balance
      const fromTokenBalanceAfter =
        await this.connection.getTokenAccountBalance(fromTokenAccount);
      this.logger.log(
        `Sender's remaining balance: ${fromTokenBalanceAfter.value.uiAmount}`,
      );

      return {
        success: true,
        signature,
        mint: mintAddress,
        from: fromWallet.publicKey.toString(),
        to: toWallet.toString(),
        amount,
        fromTokenAccount: fromTokenAccount.toString(),
        toTokenAccount: toTokenAccount.toString(),
        fromBalanceAfter: fromTokenBalanceAfter.value.uiAmount,
        toBalanceAfter: toTokenBalanceAfter.value.uiAmount,
      };
    } catch (error) {
      this.logger.error('Error transferring FungibleAsset token:', error);
      throw error;
    }
  }

  /**
   * Retrieves token balance and metadata for a specific token mint address.
   * This method fetches on-chain and off-chain metadata for the specified token,
   * determines the balance owned by the admin address, and syncs the data with the backend.
   *
   * @async
   * @param {string} mintAddress - The Solana token mint address to query
   * @returns {Promise<SyncNftDataItem>} A promise that resolves to the token's metadata and balance information
   * @throws {Error} If there's an issue with the RPC connection or metadata fetching
   */
  async getTokenBalanceAndMetadata(mintAddress: string) {
    try {
      // Initialize Metaplex SDK with the current connection
      const metaplex = new Metaplex(this.connection);

      // Get the admin's public key from the configuration
      const ownerAddress = this.configService.get<string>(
        'ADMIN_PUBLIC_KEY_SOLANA',
        'ERstETD6VQicqPBaePiRRXuRtEXNGmDYsUSdL4uvzPKi',
      );
      const owner = new PublicKey(ownerAddress);
      const mint = new PublicKey(mintAddress);

      // Get the associated token account for this owner and mint
      let balance = 0;
      let mintedValue = 0;

      try {
        // Get the associated token account address
        const tokenAccountAddress = await getAssociatedTokenAddressSync(
          mint,
          owner,
        );

        // Get the token account info
        const tokenAccount = await getAccount(
          this.connection,
          tokenAccountAddress,
        );

        // Get the mint info to determine total supply
        const mintInfo = await getMint(this.connection, mint);

        // Set the balance and total supply
        balance = Number(tokenAccount.amount);
        mintedValue = Number(mintInfo.supply.toString());
      } catch (error) {
        console.log(`No token account found or other error: ${error.message}`);
        // If token account doesn't exist or there's another error, balance remains 0
      }

      // Fetch on-chain NFT metadata using Metaplex
      const nft = await metaplex.nfts().findByMint({ mintAddress: mint });

      // Initialize variables for additional metadata
      let jsonMetadata = null;
      let imageUrl = null;
      let description = null;
      let attributes = null;

      // Fetch off-chain metadata from URI if available
      if (nft.uri) {
        try {
          const response = await fetch(nft.uri);
          jsonMetadata = await response.json();

          // Extract image URL if available
          if (jsonMetadata && jsonMetadata.image) {
            imageUrl = jsonMetadata.image;
          }

          // Extract description if available
          if (jsonMetadata.description) {
            description = jsonMetadata.description;
          }

          // Extract attributes if available
          if (jsonMetadata.attributes) {
            attributes = jsonMetadata.attributes;
          }
        } catch (error) {
          console.error('Error fetching metadata from URI:', error);
        }
      }

      // Prepare data structure for the backend
      const data: Set<SyncNftDataItem> = new Set<SyncNftDataItem>();

      // Create data item with all relevant token information
      const dataItem = {
        chain_id: '6869',
        contract_address: mintAddress,
        token_id: '1',
        nft_type: 'TOKEN_PROGRAM_ID',
        value: balance.toString(),
        minted_value: mintedValue.toString(),
        token_uri: nft.uri,
        image: imageUrl,
        name: nft.name,
        description: description,
        attributes: attributes,
        symbol: nft.symbol || '',
        decimals: 0,
        metadata_address: nft.address.toString(),
      };

      // Get backend URL from configuration
      const backendUrl = this.configService.get('JAVA_BACKEND_URL', '');

      // Add data item to the set and sync with backend
      data.add(dataItem);
      await postWithRetry(
        `${backendUrl}/${BACKEND_PATH.SYNC_NFT}`,
        Array.from(data),
        API_MAX_RETRY,
        API_TIMEOUT,
      );

      // Return the data item
      return dataItem;
    } catch (error) {
      console.error('Error getting token balance and metadata:', error);
      throw error;
    }
  }
}
