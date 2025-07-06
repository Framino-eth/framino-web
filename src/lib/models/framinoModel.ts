/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DonateRequest {
    amount: string; // USDC amount as string
}

export interface GetContractInfoResponseModel {
    address: string; // contract address
    abi: any[];      // contract ABI
}

export interface NftMintRequest {
  account: string; // recipient address
  id: number;      // tokenId 0-3 uncompleted: Spring, Summer, Autumn, Winter; 4-7 completed: Spring, Summer, Autumn, Winter
  value: number;   // initial balance
  uri: string;     // metadata URI
}

export interface NftMarkCompletedRequest {
  user: string;   // The pilgrim's wallet address
  id: number;        // The NFT tokenId
  newUri: string;    // The new metadata URI for the completed NFT
}

export interface NftRedeemRequest {
  user: string;   // Address of the NFT holder (walker)
  id: number;     // NFT tokenId
  amount: number; // Amount to redeem
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
