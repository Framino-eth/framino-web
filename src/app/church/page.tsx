"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Mountain, QrCode, CheckCircle } from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { CameraScanner } from "@/components/CameraScannerNew";
import { useAccount } from "wagmi";

export default function ChurchPage() {
  const { address, isConnected } = useAccount();
  const [scannerDrawerOpen, setScannerDrawerOpen] = useState(false);
  const [scannedBadgeId, setScannedBadgeId] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenScanner = () => {
    setScannerDrawerOpen(true);
    setScannedBadgeId(null);
    setCompletionStatus("idle");
    setErrorMessage(null);
  };

  const handleScanSuccess = async (badgeId: string) => {
    setScannedBadgeId(badgeId);
    setCompletionStatus("processing");

    // Check if wallet is connected
    if (!isConnected || !address) {
      setErrorMessage("Please connect your wallet first");
      setCompletionStatus("error");
      return;
    }

    try {
      // Call the mark-completed API endpoint
      // TODO: scan NFT badge ID qrcode => both user address and badgeId
      const response = await fetch('/api/framino/mark-completed-with-paymaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: address, // Use connected wallet address
          id: 1, // Use badge ID to determine badge ID (0-7)
          newUri: `https://framino.com/nft/completed/${badgeId}`, // New URI for completed status
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark badge as completed');
      }

      setCompletionStatus("success");
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setScannerDrawerOpen(false);
        setCompletionStatus("idle");
        setScannedBadgeId(null);
      }, 3000);

    } catch (error) {
      console.error("Failed to mark badge as completed:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      setCompletionStatus("error");
    }
  };

  const handleCloseDrawer = () => {
    setScannerDrawerOpen(false);
    setCompletionStatus("idle");
    setScannedBadgeId(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Mountain className="h-8 w-8 text-gray-700 dark:text-gray-300" />
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Framino
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  Church
                </Badge>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          {/* Header */}
          <div>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Mark badge as Complete
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Scan a hiker&apos;s badge to mark their trail as completed
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            {/* {!isConnected && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please connect your wallet to mark badges as completed
                </p>
              </div>
            )} */}
            
            <Button
              onClick={handleOpenScanner}
            //   disabled={!isConnected}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QrCode className="h-6 w-6 mr-3" />
              {isConnected ? "Scan Badge to Complete" : "Connect Wallet First"}
            </Button>
          </div>
        </div>
      </div>

      {/* Scanner Drawer */}
      <Drawer open={scannerDrawerOpen} onOpenChange={setScannerDrawerOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle>
              {completionStatus === "idle" && "Scan Hiker Badge"}
              {completionStatus === "processing" && "Processing..."}
              {completionStatus === "success" && "NFT Marked Complete!"}
              {completionStatus === "error" && "Error Occurred"}
            </DrawerTitle>
            <DrawerDescription>
              {completionStatus === "idle" && "Scan the hiker&apos;s badge to mark their badge as completed"}
              {completionStatus === "processing" && "Updating badge status on blockchain..."}
              {completionStatus === "success" && "The badge has been successfully marked as completed"}
              {completionStatus === "error" && "Failed to update badge status"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-6">
            {completionStatus === "idle" && (
              <CameraScanner
                onScanSuccess={handleScanSuccess}
                onClose={handleCloseDrawer}
                isScanning={scannerDrawerOpen}
              />
            )}

            {completionStatus === "processing" && (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Badge ID: {scannedBadgeId}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Processing blockchain transaction...
                  </p>
                </div>
              </div>
            )}

            {completionStatus === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    badge Marked as Complete!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Badge ID: {scannedBadgeId}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    The hiker&apos;s trail badge has been successfully updated to completed status
                  </p>
                </div>
              </div>
            )}

            {completionStatus === "error" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                  <QrCode className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                    Failed to Update NFT
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Badge ID: {scannedBadgeId}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCompletionStatus("idle")}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
