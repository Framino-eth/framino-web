"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { badgeNftAbi } from '@/lib/abi';

// This would be your deployed contract address
const BADGE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual contract address

export function useMintBadge() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash 
  });

  const mintBadge = async (to: string, tokenId: number, metadataUri: string) => {
    try {
      writeContract({
        address: BADGE_CONTRACT_ADDRESS as `0x${string}`,
        abi: badgeNftAbi,
        functionName: 'mintBadge',
        args: [to as `0x${string}`, BigInt(tokenId), metadataUri],
      });
    } catch (err) {
      console.error('Error minting badge:', err);
      throw err;
    }
  };

  return {
    mintBadge,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
