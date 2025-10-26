import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
  if (!config.encryption.key) {
    throw new Error('Encryption key not configured');
  }
  
  const key = Buffer.from(config.encryption.key.padEnd(32, '0').substring(0, 32));
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
  
  const key = Buffer.from(config.encryption.key.padEnd(32, '0').substring(0, 32));
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = parts.join(':');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
