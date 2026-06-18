import { ethers } from 'ethers';
import { PHAROS_CONFIG } from '../config/pharos.config';

export const getWallet = (provider: ethers.JsonRpcProvider): ethers.Wallet => {
  return new ethers.Wallet(PHAROS_CONFIG.PRIVATE_KEY, provider);
};
