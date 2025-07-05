"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Camera, X, AlertCircle, Heart, Gift, Award } from "lucide-react";
import { useAccount } from "wagmi";

export type ScannerMode = "hiker" | "shop" | "church";

interface ParsedQRData {
  badgeId?: number;
  walletAddress?: string;
  balance?: number;
  rawData?: string;
  [key: string]: unknown;
}

interface CameraScannerMultiModeProps {
  mode: ScannerMode;
  onScanSuccess: (data: string, parsedData?: ParsedQRData) => void;
  onClose: () => void;
  isScanning: boolean;
}

export function CameraScannerMultiMode({ 
  mode, 
  onScanSuccess, 
  onClose, 
  isScanning 
}: CameraScannerMultiModeProps) {
  const webcamRef = useRef<Webcam>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const router = useRouter();
  const { address } = useAccount();

  // Mode-specific configuration
  const getModeConfig = () => {
    switch (mode) {
      case "hiker":
        return {
          title: "Scan Donation QR Code",
          instruction: "Point camera at donation QR code on trail signs",
          scanningText: "Scanning for donation opportunity...",
          successText: "Donation QR Found!",
          icon: Heart,
          color: "green"
        };
      case "shop":
        return {
          title: "Scan Hiker Badge",
          instruction: "Point camera at hiker's badge QR code for redemption",
          scanningText: "Scanning hiker's badge...",
          successText: "Badge Verified!",
          icon: Gift,
          color: "blue"
        };
      case "church":
        return {
          title: "Scan Badge for Completion",
          instruction: "Point camera at hiker's badge QR code to mark as complete",
          scanningText: "Scanning badge for completion...",
          successText: "Badge Ready for Completion!",
          icon: Award,
          color: "purple"
        };
      default:
        return {
          title: "Scan QR Code",
          instruction: "Point camera at QR code",
          scanningText: "Scanning...",
          successText: "QR Code Found!",
          icon: Camera,
          color: "gray"
        };
    }
  };

  const config = getModeConfig();

  const handleHikerScan = useCallback(async (qrData: string, parsedData: ParsedQRData) => {
    // For hikers: navigate to donation form
    console.log('Hiker scanned donation QR:', parsedData);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Navigate to donation flow (you can customize this route)
    router.push('/hiker?tab=donate&qr=' + encodeURIComponent(qrData));
  }, [router]);

  const handleShopScan = useCallback(async (qrData: string, parsedData: ParsedQRData) => {
    // For shop owners: redeem badge value
    console.log('Shop owner scanning badge for redemption:', parsedData);
    
    if (parsedData.badgeId !== undefined && parsedData.walletAddress) {
      try {
        // Call redemption API
        const response = await fetch('/api/framino/redeem-with-paymaster', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenId: parsedData.badgeId,
            amount: parsedData.balance || 1,
            recipientAddress: parsedData.walletAddress,
            senderAddress: address, // Shop owner's address
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Redemption failed');
        }

        console.log('Redemption successful:', result);
      } catch (err) {
        console.error('Redemption error:', err);
        throw err;
      }
    } else {
      throw new Error('Invalid badge QR code');
    }
  }, [address]);

  const handleChurchScan = useCallback(async (qrData: string, parsedData: ParsedQRData) => {
    // For churches: mark badge as complete
    console.log('Church marking badge as complete:', parsedData);
    
    if (parsedData.badgeId !== undefined && parsedData.walletAddress) {
      try {
        // Call mark-completed API
        const response = await fetch('/api/framino/mark-completed-with-paymaster', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenId: parsedData.badgeId,
            account: parsedData.walletAddress,
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to mark badge as complete');
        }

        console.log('Badge marked as complete:', result);
      } catch (err) {
        console.error('Mark complete error:', err);
        throw err;
      }
    } else {
      throw new Error('Invalid badge QR code');
    }
  }, []);

  const handleScanResult = useCallback(async (qrData: string) => {
    setProcessing(true);
    
    try {
      let parsedData: ParsedQRData = {};
      
      // Try to parse JSON data
      try {
        parsedData = JSON.parse(qrData) as ParsedQRData;
      } catch {
        // If not JSON, treat as plain text
        parsedData = { rawData: qrData };
      }

      // Handle different modes
      switch (mode) {
        case "hiker":
          await handleHikerScan(qrData, parsedData);
          break;
        case "shop":
          await handleShopScan(qrData, parsedData);
          break;
        case "church":
          await handleChurchScan(qrData, parsedData);
          break;
      }

      onScanSuccess(qrData, parsedData);
    } catch (err) {
      console.error('Error handling scan result:', err);
      setError('Failed to process QR code');
    } finally {
      setProcessing(false);
    }
  }, [mode, onScanSuccess, handleHikerScan, handleShopScan, handleChurchScan]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isScanning && scanning) {
      intervalId = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            try {
              const img = new Image();
              img.onload = async () => {
                try {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert canvas to blob and decode
                    canvas.toBlob(async (blob) => {
                      if (blob) {
                        try {
                          const url = URL.createObjectURL(blob);
                          const result = await codeReader.current.decodeFromVideo(url);
                          URL.revokeObjectURL(url);
                          if (result) {
                            const qrData = result.getText();
                            setScanResult(qrData);
                            setScanning(false);
                            await handleScanResult(qrData);
                          }
                        } catch {
                          // Silent error - QR code not found in this frame
                        }
                      }
                    }, 'image/jpeg');
                  }
                } catch {
                  // Silent error - QR code not found in this frame
                }
              };
              img.src = imageSrc;
            } catch (err) {
              console.error('Scanner error:', err);
            }
          }
        }
      }, 1000); // Scan every second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isScanning, scanning, handleScanResult]);

  const startScanning = () => {
    setScanning(true);
    setError(null);
    setScanResult(null);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  // Mock scan for demo purposes - uses mode-specific mock data
  const mockScan = () => {
    const mockData = getMockDataForMode();
    setScanResult(mockData);
    setScanning(false);
    setError(null);
    onScanSuccess(mockData);
  };

  const getMockDataForMode = () => {
    switch (mode) {
      case "hiker":
        return "DONATION_TRAIL_001_$5_USDC";
      case "shop":
        return JSON.stringify({
          badgeId: 1,
          walletAddress: "0x1234...5678",
          balance: 5,
          type: "seasonal",
          status: "earned"
        });
      case "church":
        return JSON.stringify({
          badgeId: 2,
          walletAddress: "0x1234...5678",
          type: "seasonal",
          status: "earned"
        });
      default:
        return "GENERIC_QR_CODE";
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        border: "border-green-400",
        bg: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        text: "text-green-800 dark:text-green-200",
        icon: "text-green-600 dark:text-green-400",
        button: "bg-green-600 hover:bg-green-700"
      },
      blue: {
        border: "border-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        text: "text-blue-800 dark:text-blue-200",
        icon: "text-blue-600 dark:text-blue-400",
        button: "bg-blue-600 hover:bg-blue-700"
      },
      purple: {
        border: "border-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        borderColor: "border-purple-200 dark:border-purple-800",
        text: "text-purple-800 dark:text-purple-200",
        icon: "text-purple-600 dark:text-purple-400",
        button: "bg-purple-600 hover:bg-purple-700"
      },
      gray: {
        border: "border-gray-400",
        bg: "bg-gray-50 dark:bg-gray-900/20",
        borderColor: "border-gray-200 dark:border-gray-800",
        text: "text-gray-800 dark:text-gray-200",
        icon: "text-gray-600 dark:text-gray-400",
        button: "bg-gray-600 hover:bg-gray-700"
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const colors = getColorClasses(config.color);
  const IconComponent = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {config.title}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        {/* Camera View */}
        <div className="relative w-full aspect-square max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 400,
              height: 400,
              facingMode: "environment" // Use back camera on mobile
            }}
            className="w-full h-full object-cover"
          />
          
          {/* Scanning overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-48 h-48 border-2 ${colors.border} rounded-lg animate-pulse`}>
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 ${colors.border}`}></div>
                <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${colors.border}`}></div>
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 ${colors.border}`}></div>
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 ${colors.border}`}></div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
          {scanning ? config.scanningText : config.instruction}
        </p>
      </div>

      {/* Processing State */}
      {processing && (
        <div className={`p-4 ${colors.bg} rounded-lg border ${colors.borderColor}`}>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            <span className={`text-sm font-medium ${colors.text}`}>
              Processing {mode} action...
            </span>
          </div>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && !processing && (
        <div className={`p-4 ${colors.bg} rounded-lg border ${colors.borderColor}`}>
          <div className="flex items-center space-x-2">
            <IconComponent className={`h-5 w-5 ${colors.icon}`} />
            <span className={`text-sm font-medium ${colors.text}`}>
              {config.successText}
            </span>
          </div>
          <p className={`text-xs ${colors.text} mt-1 opacity-75`}>
            Data: {scanResult.substring(0, 50)}...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center space-x-3">
        {!scanning ? (
          <>
            <Button 
              onClick={startScanning} 
              className={`${colors.button} text-white`}
              disabled={processing}
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
            <Button 
              onClick={mockScan} 
              variant="outline" 
              className="text-sm"
              disabled={processing}
            >
              Demo Scan
            </Button>
          </>
        ) : (
          <Button onClick={stopScanning} variant="outline" disabled={processing}>
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  );
}
