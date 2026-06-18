import { ethers } from 'ethers';
import { PHAROS_CONFIG } from '../config/pharos.config';

export const getProvider = (): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(PHAROS_CONFIG.RPC_URL, {
    chainId: parseInt(PHAROS_CONFIG.CHAIN_ID),
    name: 'pharos-atlantic'
  });
};
