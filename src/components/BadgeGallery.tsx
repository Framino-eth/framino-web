"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ExternalLink
} from "lucide-react";
import { useAccount } from "wagmi";
import { useMintBadge } from "@/hooks/useMintBadge";

// Import seasonal badge images
import springComplete from "@/assets/spring-complete.png";
import spring from "@/assets/spring.png";
import summerComplete from "@/assets/summer-complete.png";
import summer from "@/assets/summer.png";
import autumnComplete from "@/assets/autumn-complete.png";
import autumn from "@/assets/autumn.png";
import winterComplete from "@/assets/winter-complete.png";
import winter from "@/assets/winter.png";

// Mock data for badges/NFTs
const mockBadges = [
  {
    id: 1,
    name: "Donation #1",
    description: "Complete hiking challenges during spring season",
    rarity: "25 / 100",
    earned: false,
    imageComplete: springComplete,
    imageIncomplete: spring,
  },
  {
    id: 2,
    name: "Donation #2",
    description: "Conquer trails under the summer sun",
    rarity: "40 / 100",
    earned: false,
    imageComplete: summerComplete,
    imageIncomplete: summer,
  },
  {
    id: 3,
    name: "Donation #3",
    description: "Discover the beauty of fall hiking",
    rarity: "60 / 100",
    earned: false,
    imageComplete: autumnComplete,
    imageIncomplete: autumn,
  },
  {
    id: 4,
    name: "Donation #4",
    description: "Brave the cold on winter expeditions",
    rarity: "15 / 100",
    earned: false,
    imageComplete: winterComplete,
    imageIncomplete: winter,
  },
];

export default function BadgeGallery() {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { mintBadge, isPending, isConfirming, isSuccess, error, hash } = useMintBadge();

  const handleMintBadge = async () => {
    if (!address || !isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    const currentBadge = mockBadges[currentBadgeIndex];
    try {
      // In a real app, you'd generate proper metadata URI
      const metadataUri = `https://api.framino.com/metadata/${currentBadge.id}`;
      await mintBadge(address, currentBadge.id, metadataUri);
    } catch (err) {
      console.error("Failed to mint badge:", err);
    }
  };

  const nextBadge = () => {
    setCurrentBadgeIndex((prev) => (prev + 1) % mockBadges.length);
  };

  const prevBadge = () => {
    setCurrentBadgeIndex(
      (prev) => (prev - 1 + mockBadges.length) % mockBadges.length
    );
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
      <Card className="border border-gray-200 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-gray-600" />
            Badge Gallery
          </CardTitle>
          <CardDescription>
            Your hiking donation and USDC amounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Badge Carousel */}
          <div className="relative">
            {/* Carousel Container */}
            <div className="relative h-80 flex items-center justify-center overflow-hidden">
              {mockBadges.map((badge, index) => {
                const { scale, opacity, zIndex } = getScaleAndOpacity(index);
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
                      className={`w-56 h-56 rounded-full bg-gray-100 flex items-center justify-center shadow-lg overflow-hidden transition-all ${
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

          {/* Badge Information Area */}
          <div className="mt-8 text-center">
            <motion.div
              key={currentBadgeIndex}
              initial={{ opacity: 0.25, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {mockBadges[currentBadgeIndex].name}
              </h3>
              <div className="flex items-center justify-center space-x-3">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 text-sm px-3 py-1"
                >
                  {mockBadges[currentBadgeIndex].rarity}
                </Badge>
                {mockBadges[currentBadgeIndex].earned && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-400 text-sm px-3 py-1"
                  >
                    ✓ Earned
                  </Badge>
                )}
                {!mockBadges[currentBadgeIndex].earned && (
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

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {mockBadges.map((_, index) => (
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
                  {mockBadges[currentBadgeIndex].name}
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
                      mockBadges[currentBadgeIndex].earned
                        ? mockBadges[currentBadgeIndex].imageComplete
                        : mockBadges[currentBadgeIndex].imageIncomplete
                    }
                    alt={mockBadges[currentBadgeIndex].name}
                    width={100}
                    height={100}
                    className={`object-cover transition-all duration-300 ${
                      mockBadges[currentBadgeIndex].earned
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
                    {mockBadges[currentBadgeIndex].rarity}
                  </Badge>
                  {mockBadges[currentBadgeIndex].earned ? (
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
                </div>
              </div>

              {/* QR Code Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50">
                {/* Mint to Wallet Section */}
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Mint to Your Wallet
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Collect this badge as an NFT in your connected wallet
                  </p>
                  
                  {isConnected ? (
                    <Button
                      onClick={handleMintBadge}
                      disabled={isPending || isConfirming}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {isPending ? "Preparing..." : isConfirming ? "Minting..." : "Mint Badge NFT"}
                    </Button>
                  ) : (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Connect your wallet to mint this badge
                    </p>
                  )}
                  
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
                    Badge ID: {mockBadges[currentBadgeIndex].id} • Earned on Mar 15, 2024
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                {isSuccess && (
                  <Button
                    onClick={() => window.open(`https://etherscan.io/tx/${hash}`, '_blank')}
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
