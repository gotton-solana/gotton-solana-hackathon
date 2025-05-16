import { Injectable } from '@nestjs/common';
import { EncryptDto } from './dto/encrypt-crypto.dto';
import { DecryptDto } from './dto/decrypt-crypto.dto';
import { ConfigService } from '@nestjs/config';
import { encryptData, decryptData } from 'src/utils/helpers/crypto';

@Injectable()
export class CryptoService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Encrypts the provided data using AES encryption.
   * Fetches the secret key and IV from environment variables via ConfigService.
   *
   * @param encryptDto - Contains the plaintext data to encrypt.
   * @returns Encrypted string.
   */
  encrypt(encryptDto: EncryptDto) {
    const secretKey = this.config.get('SECRET_KEY');
    const secretIV = this.config.get('SECRET_IV');
    return encryptData(encryptDto.data, secretKey, secretIV);
  }

  /**
   * Decrypts the provided encrypted data using AES decryption.
   * Uses the same secret key and IV that were used for encryption.
   *
   * @param decryptDto - Contains the encrypted string to decrypt.
   * @returns Decrypted plaintext string.
   */
  decrypt(decryptDto: DecryptDto) {
    const secretKey = this.config.get('SECRET_KEY');
    const secretIV = this.config.get('SECRET_IV');
    return decryptData(decryptDto.encryptedData, secretKey, secretIV);
  }
}
