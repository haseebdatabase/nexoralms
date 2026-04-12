import CryptoJS from 'crypto-js';

// In a real application, this secret should be stored securely (e.g., in an environment variable)
// For HM Nexora LMS Pro, we can derive a key from the user's UID to ensure salt-based isolation.
const GLOBAL_SECRET = 'nexora-lms-pro-secret-key-2024';

/**
 * Encrypts a string using AES-256
 * @param {string} text 
 * @param {string} userSecret - Optional extra security layer
 * @returns {string}
 */
export const encryptPassword = (text, userSecret = '') => {
  if (!text) return '';
  const key = GLOBAL_SECRET + userSecret;
  return CryptoJS.AES.encrypt(text, key).toString();
};

/**
 * Decrypts a string using AES-256
 * @param {string} ciphertext 
 * @param {string} userSecret 
 * @returns {string}
 */
export const decryptPassword = (ciphertext, userSecret = '') => {
  if (!ciphertext) return '';
  const key = GLOBAL_SECRET + userSecret;
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
