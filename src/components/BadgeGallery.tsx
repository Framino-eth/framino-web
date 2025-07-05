"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useMintBadge } from "@/hooks/useMintBadge";
import { readContracts } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import FraminoNFTABI from "@/lib/abi/FraminoNFT.json";
import { Abi } from "viem";
import { StaticImageData } from "next/image";

// Import seasonal badge images
// import springComplete from "@/assets/spring-complete.png";
// import spring from "@/assets/spring.png";
// import summerComplete from "@/assets/summer-complete.png";
// import summer from "@/assets/summer.png";
// import autumnComplete from "@/assets/autumn-complete.png";
// import autumn from "@/assets/autumn.png";
// import winterComplete from "@/assets/winter-complete.png";
// import winter from "@/assets/winter.png";

// Mock data for badges/NFTs
const mockBadges: EnhancedBadge[] = [];
console.log(mockBadges);

interface EnhancedBadge {
  id: number;
  name: string;
  description: string;
  rarity: string;
  earned: boolean;
  imageComplete: StaticImageData;
  imageIncomplete: StaticImageData;
  balance?: number;
  isCompleted?: boolean;
  uri?: string;
  customUri?: string;
}

export default function BadgeGallery() {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [badges, setBadges] = useState<EnhancedBadge[]>(mockBadges);
  const [lastFetchedAddress, setLastFetchedAddress] = useState<string | null>(
    null
  );

  const { address, isConnected } = useAccount();
  const { isSuccess, error, hash } = useMintBadge();

  const contractAddress =
    process.env.NEXT_PUBLIC_FRAMINO_NFT_CONTRACT_ADDRESS ||
    "0x73050b11f0Dd5C48Ed1C05c56236F0D235ba4f57";

  // Optimized fetch function - get balances first, then details for owned badges only
  const fetchUserNFTs = useCallback(
    async (walletAddress: string) => {
      if (!walletAddress || isLoading) return;

      setIsLoading(true);

      try {
        // Query all possible NFT IDs (0-7 based on your contract)
        const tokenIds = [0, 1, 2, 3, 4, 5, 6, 7];

        // First, fetch balances to determine which NFTs the user owns
        const balanceCalls = tokenIds.map((id) => ({
          address: contractAddress as `0x${string}`,
          abi: FraminoNFTABI as Abi,
          functionName: "getBalance",
          args: [walletAddress, id],
        }));

        const balances = await readContracts(config, {
          contracts: balanceCalls,
        });

        // Find which tokens the user owns
        const ownedTokenIds: number[] = [];
        tokenIds.forEach((tokenId, index) => {
          const balance = (balances[index].result as number) || 0;
          if (balance > 0) {
            ownedTokenIds.push(tokenId);
          }
        });

        // If user owns badges, fetch details for those badges only
        const badgeDetails: Record<
          number,
          { isCompleted: boolean; uri: string; customUri?: string; value?: number }
        > = {};

        if (ownedTokenIds.length > 0) {
          console.log(
            `Fetching details for ${ownedTokenIds.length} owned badges...`
          );

          // Fetch details only for owned badges
          const completedCalls = ownedTokenIds.map((id) => ({
            address: contractAddress as `0x${string}`,
            abi: FraminoNFTABI as Abi,
            functionName: "isCompleted",
            args: [walletAddress, id],
          }));

          const uriCalls = ownedTokenIds.map((id) => ({
            address: contractAddress as `0x${string}`,
            abi: FraminoNFTABI as Abi,
            functionName: "getUserTokenURI",
            args: [walletAddress, id],
          }));

          const customUriCalls = ownedTokenIds.map((id) => ({
            address: contractAddress as `0x${string}`,
            abi: FraminoNFTABI as Abi,
            functionName: "customURIs",
            args: [walletAddress, id],
          }));

          // Execute detail calls for owned badges
          const [completedStatus, uris, customUris] = await Promise.all([
            readContracts(config, { contracts: completedCalls }),
            readContracts(config, { contracts: uriCalls }),
            readContracts(config, { contracts: customUriCalls }),
          ]);

          // Process details for owned badges
          ownedTokenIds.forEach((tokenId, index) => {
            badgeDetails[tokenId] = {
              isCompleted: (completedStatus[index].result as boolean) || false,
              uri: (uris[index].result as string) || "",
              customUri: (customUris[index].result as string) || undefined,
            };
          });
        }

        // Update badges with ownership and detail data
        const updatedBadges = mockBadges.map((badge) => {
          const isOwned = ownedTokenIds.includes(badge.id);
          const details = badgeDetails[badge.id];

          return {
            ...badge,
            earned: isOwned,
            balance: isOwned ? 1 : 0,
            isCompleted: details?.isCompleted || false,
            uri: details?.uri || "",
            customUri: details?.customUri,
          };
        });

        setBadges(updatedBadges);
        setLastFetchedAddress(walletAddress);

        // Enhanced console log with details
        console.log("=== USER NFT DATA ===");
        console.log("Total NFTs owned:", ownedTokenIds.length);
        console.log("Owned token IDs:", ownedTokenIds);
        if (ownedTokenIds.length > 0) {
          console.log("Badge Details:");
          ownedTokenIds.forEach((tokenId) => {
            const badge = updatedBadges.find((b) => b.id === tokenId);
            console.log(`- Badge ${tokenId} (${badge?.name}):`, {
              completed: badgeDetails[tokenId]?.isCompleted,
              uri: badgeDetails[tokenId]?.uri,
              customUri: badgeDetails[tokenId]?.customUri,
            });
          });
        }
        console.log("===================");
      } catch (err) {
        console.error("Error fetching NFT data:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [contractAddress, isLoading]
  );

  // Optimized useEffect with proper dependency management
  useEffect(() => {
    // Only fetch if:
    // 1. Wallet is connected
    // 2. Address exists
    // 3. Address has changed since last fetch
    // 4. Not currently loading
    if (
      isConnected &&
      address &&
      address !== lastFetchedAddress &&
      !isLoading
    ) {
      fetchUserNFTs(address);
    }

    // Reset data when wallet disconnects
    if (!isConnected && lastFetchedAddress) {
      setBadges(mockBadges);
      setLastFetchedAddress(null);
    }
  }, [isConnected, address, lastFetchedAddress, fetchUserNFTs, isLoading]);

  // Refresh NFT data after successful minting
  useEffect(() => {
    if (isSuccess && address && !isLoading) {
      // Add a small delay to allow blockchain to update
      const timer = setTimeout(() => {
        setLastFetchedAddress(null); // Force refetch
        fetchUserNFTs(address);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, address, fetchUserNFTs, isLoading]);

  const nextBadge = () => {
    setCurrentBadgeIndex((prev) => (prev + 1) % badges.length);
  };

  const prevBadge = () => {
    setCurrentBadgeIndex((prev) => (prev - 1 + badges.length) % badges.length);
  };

  const handleBadgeClick = (index: number) => {
    if (index === currentBadgeIndex) {
      // If clicking on the active badge, open modal
      setIsModalOpen(true);
    } else {
      // If clicking on a different badge, navigate to it
      setCurrentBadgeIndex(index);
    }
  };

  const getScaleAndOpacity = (index: number) => {
    const distance = Math.abs(index - currentBadgeIndex);
    if (distance === 0) return { scale: 1, opacity: 1, zIndex: 10 };
    if (distance === 1) return { scale: 0.7, opacity: 0.6, zIndex: 5 };
    if (distance === 2) return { scale: 0.6, opacity: 0.3, zIndex: 2 };
    return { scale: 0.4, opacity: 0.1, zIndex: 1 };
  };

  return (
    <>
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-200" />
            Badges
          </CardTitle>
          <CardDescription>
            Your hiking donation and USDC amounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading your NFT badges...
              </p>
            </div>
          )}

          {/* Badge Carousel */}
          {!isLoading && (
            <div>
              <div className="relative">
                {/* Carousel Container */}
                <div className="relative h-80 flex items-center justify-center overflow-hidden">
                  {badges?.map((badge, index) => {
                    const { scale, opacity, zIndex } =
                      getScaleAndOpacity(index);
                    const isActive = index === currentBadgeIndex;
                    const distance = index - currentBadgeIndex;
                    const translateX = distance * 240; // Spread badges horizontally

                    return (
                      <motion.div
                        key={badge.id}
                        className="absolute cursor-pointer"
                        style={{ zIndex }}
                        animate={{
                          scale,
                          opacity,
                          x: translateX,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: "easeInOut",
                        }}
                        onClick={() => handleBadgeClick(index)}
                      >
                        <div
                          className={`w-56 h-56 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-lg overflow-hidden transition-all ${
                            isActive
                              ? "ring-4 ring-gray-300 dark:ring-gray-600"
                              : ""
                          }`}
                        >
                          <Image
                            src={
                              badge.earned
                                ? badge.imageComplete
                                : badge.imageIncomplete
                            }
                            alt={badge.name}
                            width={144}
                            height={144}
                            className={`object-cover transition-all duration-300 ${
                              badge.earned ? "" : "grayscale-50 opacity-50"
                            }`}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevBadge}
                    className="h-10 w-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextBadge}
                    className="h-10 w-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <motion.div
                  key={currentBadgeIndex}
                  initial={{ opacity: 0.25, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {badges[currentBadgeIndex]?.name}
                  </h3>
                  <div className="flex items-center justify-center space-x-3">
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-800 text-sm px-3 py-1"
                    >
                      {badges[currentBadgeIndex]?.rarity}
                    </Badge>
                    {badges[currentBadgeIndex]?.earned &&
                    badges[currentBadgeIndex]?.isCompleted ? (
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-400 text-sm px-3 py-1"
                      >
                        🏆 Completed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-gray-500 border-gray-400 text-sm px-3 py-1"
                      >
                        🥾 In Progress
                      </Badge>
                    )}
                  </div>
                </motion.div>
              </div>

              <div className="flex justify-center space-x-2 mt-6">
                {badges.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBadgeIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentBadgeIndex
                        ? "bg-gray-800 dark:bg-gray-300 w-8"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {badges[currentBadgeIndex].name}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Badge Image */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 flex items-center justify-center overflow-hidden">
                  <Image
                    src={
                      badges[currentBadgeIndex].earned
                        ? badges[currentBadgeIndex].imageComplete
                        : badges[currentBadgeIndex].imageIncomplete
                    }
                    alt={badges[currentBadgeIndex].name}
                    width={100}
                    height={100}
                    className={`object-cover transition-all duration-300 ${
                      badges[currentBadgeIndex].earned
                        ? ""
                        : "grayscale-50 opacity-50"
                    }`}
                  />
                </div>
              </div>

              {/* Badge Info */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1"
                  >
                    {badges[currentBadgeIndex].rarity}
                  </Badge>
                  {badges[currentBadgeIndex].earned ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-400 text-sm px-3 py-1"
                    >
                      ✓ Earned
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-gray-500 border-gray-400 text-sm px-3 py-1"
                    >
                      🥾 In Progress
                    </Badge>
                  )}
                  {badges[currentBadgeIndex].earned &&
                    badges[currentBadgeIndex].isCompleted && (
                      <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-400 text-sm px-3 py-1"
                      >
                        🏆 Completed
                      </Badge>
                    )}
                </div>

                {/* Badge Details Section */}
                {badges[currentBadgeIndex].earned && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Badge Details
                    </h5>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        {badges[currentBadgeIndex].isCompleted
                          ? "Completed"
                          : "Earned but not completed"}
                      </div>
                      {badges[currentBadgeIndex].uri && (
                        <div>
                          <span className="font-medium">Token URI:</span>{" "}
                          <span className="break-all">
                            {badges[currentBadgeIndex].uri}
                          </span>
                        </div>
                      )}
                      {badges[currentBadgeIndex].customUri && (
                        <div>
                          <span className="font-medium">Custom URI:</span>{" "}
                          <span className="break-all">
                            {badges[currentBadgeIndex].customUri}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50">
                {/* Mint to Wallet Section */}
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Show this qrcode to shop owners/church
                  </h4>

                  {isSuccess && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        🎉 Badge minted successfully!
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Failed to mint badge. Please try again.
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Code Placeholder */}
                <div className="flex justify-center mb-4">
                  <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                        <svg
                          className="w-16 h-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h2m1.5 5h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500">QR Code Here</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Shop owners can scan this code to verify your achievement
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Badge ID: {badges[currentBadgeIndex].id} • Earned on Mar 15,
                    2024
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                {isSuccess && (
                  <Button
                    onClick={() =>
                      window.open(`https://etherscan.io/tx/${hash}`, "_blank")
                    }
                    variant="outline"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                )}
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
