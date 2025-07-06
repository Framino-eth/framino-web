"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, ExternalLink, Wallet } from "lucide-react";
// import { ethers } from "ethers";
// const FraminoNFTAbi = await import("@/components/FraminoNFT.json");

// For now, we'll use a mock implementation
// You can replace this with actual ethers.js integration when ready
const CONTRACT_ADDRESS = "0x73050b11f0Dd5C48Ed1C05c56236F0D235ba4f57";

interface RedeemButtonProps {
  tokenId: string;
  totalAmount: number;
  cartItems: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  onRedeemSuccess: () => void;
  onRedeemError: (error: string) => void;
}

export function RedeemButton({
  tokenId,
  totalAmount,
  cartItems,
  onRedeemSuccess,
  onRedeemError,
}: RedeemButtonProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { address, isConnected } = useAccount();

  const handleRedeem = async () => {
    if (!isConnected) {
      onRedeemError(
        "Please connect your wallet first to process the redemption."
      );
      return;
    }

    setIsRedeeming(true);
    setTxHash(null);

    try {
      console.log("Processing redemption for token:", tokenId);
      console.log("Total amount:", totalAmount);
      console.log("Cart items:", cartItems);
      console.log("Admin wallet:", address);

      // Call the redeem-with-paymaster API endpoint
      const response = await fetch('/api/framino/redeem-with-paymaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: address, // The admin wallet address who is processing the redemption
          id: 1, // this will be hardcoded for now, but can be dynamic
          amount: totalAmount, // Total redemption amount
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Redemption failed');
      }

      // Extract transaction hash from the response
      const transactionHash = result.data.txHash;
      setTxHash(transactionHash);

      console.log("Redemption successful! Transaction hash:", transactionHash);
      onRedeemSuccess();
    } catch (error: unknown) {
      console.error("Redemption failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Redemption failed. Please try again.";
      onRedeemError(errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  if (txHash) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Redemption Successful!</span>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300 mb-2">
            Transaction Hash:
          </p>
          <div className="flex items-center space-x-2">
            <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border font-mono text-green-800 dark:text-green-200">
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() =>
                window.open(`https://sepolia.arbiscan.io/tx/${txHash}`, "_blank")
              }
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Wallet Connection Status */}
      <div
        className={`p-3 rounded-lg border ${
          isConnected
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
        }`}
      >
        <div className="flex items-center space-x-2 mb-2">
          <Wallet
            className={`h-4 w-4 ${
              isConnected
                ? "text-green-600 dark:text-green-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              isConnected
                ? "text-green-900 dark:text-green-200"
                : "text-yellow-900 dark:text-yellow-200"
            }`}
          >
            {isConnected ? "Admin Wallet Connected" : "Wallet Not Connected"}
          </span>
        </div>
        {isConnected && address && (
          <p className="text-xs text-green-700 dark:text-green-300">
            Admin: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
        {!isConnected && (
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            Please connect your wallet to process blockchain redemptions
          </p>
        )}
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Blockchain Redemption
          </span>
        </div>
        <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <p>• Token ID: {tokenId}</p>
          <p>• Total Value: ${totalAmount.toFixed(2)}</p>
          <p>
            • Items:{" "}
            {cartItems.reduce((total, item) => total + item.quantity, 0)}
          </p>
          <p>
            • Contract: {CONTRACT_ADDRESS.slice(0, 10)}...
            {CONTRACT_ADDRESS.slice(-8)}
          </p>
        </div>
      </div>

      <Button
        onClick={handleRedeem}
        disabled={isRedeeming || !isConnected}
        className={`w-full ${
          !isConnected
            ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
            : "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
        }`}
      >
        {!isConnected ? (
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet First</span>
          </div>
        ) : isRedeeming ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-900"></div>
            <span>Processing Redemption...</span>
          </div>
        ) : (
          "Confirm Blockchain Redemption"
        )}
      </Button>
    </div>
  );
}
