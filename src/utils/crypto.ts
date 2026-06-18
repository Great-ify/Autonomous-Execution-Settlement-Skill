import { createHash } from 'crypto';

export const generateIntegrityHash = (data: any): string => {
  const serialized = JSON.stringify(data, Object.keys(data).sort());
  return createHash('sha256').update(serialized).digest('hex');
};

export const isValidHash = (hash: string): boolean => {
  return /^[0-9a-f]{64}$/i.test(hash);
};
