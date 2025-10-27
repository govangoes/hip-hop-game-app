import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
  if (!config.encryption.key) {
    throw new Error('Encryption key not configured');
  }
  
  if (config.encryption.key.length !== 32) {
    throw new Error('Encryption key must be exactly 32 characters');
  }
  
  const key = Buffer.from(config.encryption.key);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (text: string): string => {
  if (!config.encryption.key) {
    throw new Error('Encryption key not configured');
  }
  
  if (config.encryption.key.length !== 32) {
    throw new Error('Encryption key must be exactly 32 characters');
  }
  
  const key = Buffer.from(config.encryption.key);
  const parts = text.split(':');
  
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }
  
  const ivHex = parts[0];
  if (!ivHex || ivHex.length !== IV_LENGTH * 2) {
    throw new Error('Invalid IV in encrypted data');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = parts[1];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
