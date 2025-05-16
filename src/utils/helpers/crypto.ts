import CryptoJS from 'crypto-js';

/**
 * Encrypts a given data string using AES encryption with the specified secret key and initialization vector (IV).
 *
 * @param data - The plain text data to be encrypted.
 * @param secretKey - The secret key used for encryption.
 * @param iv - The initialization vector (IV) used for encryption.
 * @returns The encrypted data as a string.
 */
export function encryptData(data: string, secretKey: string, iv: string) {
  // Generate a 32-byte key from the SHA-512 hash of the secret key (hashed to 512 bits, then truncated to 256 bits)
  const key = CryptoJS.SHA512(secretKey)
    .toString(CryptoJS.enc.Hex)
    .substring(0, 32);

  // Generate a 16-byte IV from the SHA-512 hash of the IV string (hashed to 512 bits, then truncated to 128 bits)
  const encryptionIV = CryptoJS.SHA512(iv)
    .toString(CryptoJS.enc.Hex)
    .substring(0, 16);

  // Convert the key and IV into CryptoJS word arrays for AES encryption
  const keyWordArray = CryptoJS.enc.Hex.parse(key);
  const ivWordArray = CryptoJS.enc.Hex.parse(encryptionIV);

  // Perform AES encryption with CBC mode and PKCS7 padding
  const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC, // Cipher Block Chaining (CBC) mode for encryption
    padding: CryptoJS.pad.Pkcs7, // Padding scheme to ensure the data fits into blocks
  });

  // Return the encrypted data as a string
  return encrypted.toString();
}

/**
 * Decrypts an encrypted data string using AES decryption with the specified secret key and initialization vector (IV).
 *
 * @param encryptedData - The encrypted data to be decrypted.
 * @param secretKey - The secret key used for decryption.
 * @param iv - The initialization vector (IV) used for decryption.
 * @returns The decrypted data as a string, or null if decryption fails.
 */
export function decryptData(
  encryptedData: string,
  secretKey: string,
  iv: string,
) {
  try {
    // Generate a 32-byte key from the SHA-512 hash of the secret key (hashed to 512 bits, then truncated to 256 bits)
    const key = CryptoJS.SHA512(secretKey)
      .toString(CryptoJS.enc.Hex)
      .substring(0, 32);

    // Generate a 16-byte IV from the SHA-512 hash of the IV string (hashed to 512 bits, then truncated to 128 bits)
    const encryptionIV = CryptoJS.SHA512(iv)
      .toString(CryptoJS.enc.Hex)
      .substring(0, 16);

    // Convert the key and IV into CryptoJS word arrays for AES decryption
    const keyWordArray = CryptoJS.enc.Hex.parse(key);
    const ivWordArray = CryptoJS.enc.Hex.parse(encryptionIV);

    // Perform AES decryption with CBC mode and PKCS7 padding
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyWordArray, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC, // Cipher Block Chaining (CBC) mode for decryption
      padding: CryptoJS.pad.Pkcs7, // Padding scheme used for decryption
    });

    // Convert the decrypted word array to a UTF-8 string and return it
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    // Return null if decryption fails
    return null;
  }
}
