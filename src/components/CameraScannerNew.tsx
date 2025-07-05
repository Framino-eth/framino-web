"use client";

import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Camera, AlertCircle, QrCode, Heart, Gift, Award } from "lucide-react";

export type ScannerMode = "hiker" | "shop" | "church";

interface CameraScannerProps {
  onScanSuccess: (data: string) => void;
  onClose?: () => void;
  isScanning: boolean;
  mode?: ScannerMode;
}

export function CameraScanner({
  onScanSuccess,
  isScanning,
  mode = "hiker",
}: CameraScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

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
          color: "green",
          mockData: "DONATION_TRAIL_001_$5_USDC"
        };
      case "shop":
        return {
          title: "Scan Hiker Badge",
          instruction: "Point camera at hiker's badge QR code for redemption",
          scanningText: "Scanning hiker's badge...",
          successText: "Badge Verified!",
          icon: Gift,
          color: "blue",
          mockData: JSON.stringify({
            badgeId: 1,
            walletAddress: "0x1234...5678",
            balance: 5,
            type: "seasonal",
            status: "earned"
          })
        };
      case "church":
        return {
          title: "Scan Badge for Completion",
          instruction: "Point camera at hiker's badge QR code to mark as complete",
          scanningText: "Scanning badge for completion...",
          successText: "Badge Ready for Completion!",
          icon: Award,
          color: "purple",
          mockData: JSON.stringify({
            badgeId: 2,
            walletAddress: "0x1234...5678",
            type: "seasonal",
            status: "earned"
          })
        };
      default:
        return {
          title: "Scan QR Code",
          instruction: "Point camera at QR code",
          scanningText: "Scanning...",
          successText: "QR Code Found!",
          icon: QrCode,
          color: "gray",
          mockData: "GENERIC_QR_CODE"
        };
    }
  };

  const config = getModeConfig();

  // Real QR code scanning using ZXing library
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isScanning && scanning) {
      console.log(`🎥 Starting QR scanner in ${mode} mode...`);
      
      intervalId = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            console.log('📸 Taking screenshot for QR analysis...');
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
                    console.log(`🖼️ Created canvas: ${canvas.width}x${canvas.height}`);
                    
                    // Convert canvas to blob and decode
                    canvas.toBlob(async (blob) => {
                      if (blob) {
                        try {
                          const url = URL.createObjectURL(blob);
                          console.log('🔍 Attempting QR decode...');
                          const result = await codeReader.current.decodeFromVideo(url);
                          URL.revokeObjectURL(url);
                          if (result) {
                            const qrData = result.getText();
                            console.log('✅ QR CODE FOUND!');
                            console.log('📄 QR Data:', qrData);
                            console.log('🎯 Mode:', mode);
                            console.log('📊 Result object:', result);
                            
                            setScanResult(qrData);
                            setScanning(false);
                            setError(null);
                            onScanSuccess(qrData);
                          }
                        } catch (decodeError) {
                          // More detailed error logging for debugging
                          if (decodeError instanceof Error) {
                            console.log('❌ QR decode failed:', decodeError.message);
                          } else {
                            console.log('⚠️ No QR code found in this frame');
                          }
                        }
                      }
                    }, 'image/jpeg');
                  }
                } catch (canvasError) {
                  console.error('🖼️ Canvas error:', canvasError);
                }
              };
              img.src = imageSrc;
            } catch (err) {
              console.error('📸 Scanner error:', err);
              setError('Camera scanning error');
            }
          } else {
            console.log('📷 No image source available from webcam');
          }
        } else {
          console.log('📹 Webcam ref not available');
        }
      }, 1000); // Scan every second
    } else {
      console.log('⏹️ Scanner stopped or not active');
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isScanning, scanning, onScanSuccess, mode]);

  const startScanning = () => {
    console.log('🚀 START SCANNING BUTTON CLICKED');
    console.log('🎯 Mode:', mode);
    setScanning(true);
    setError(null);
    setScanResult(null);
  };

  const stopScanning = () => {
    console.log('🛑 STOP SCANNING BUTTON CLICKED');
    setScanning(false);
  };

  // Mock scan for demo purposes - uses mode-specific mock data
  const mockScan = () => {
    console.log('🎭 DEMO SCAN TRIGGERED');
    console.log('🎯 Mode:', mode);
    console.log('📄 Mock data:', config.mockData);
    
    setScanResult(config.mockData);
    setScanning(false);
    setError(null);
    onScanSuccess(config.mockData);
    
    console.log('✅ Demo scan completed successfully');
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
      <div className="flex items-center justify-between"></div>

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
              facingMode: "environment", // Use back camera on mobile
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

          {/* Demo QR code indicator */}
          {!scanning && !scanResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white bg-black/50 p-4 rounded-lg">
                <IconComponent className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">{config.instruction}</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
          {scanning ? `${config.scanningText} Hold steady for best results.` : config.instruction}
        </p>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div className={`p-4 ${colors.bg} rounded-lg border ${colors.borderColor}`}>
          <div className="flex items-center space-x-2">
            <IconComponent className={`h-5 w-5 ${colors.icon}`} />
            <span className={`text-sm font-medium ${colors.text}`}>
              {config.successText}
            </span>
          </div>
          <p className={`text-xs ${colors.text} mt-1 opacity-75`}>
            QR Data: {scanResult.length > 50 ? `${scanResult.substring(0, 50)}...` : scanResult}
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
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
            <Button onClick={mockScan} variant="outline" className="text-sm">
              Demo Scan
            </Button>
          </>
        ) : (
          <Button onClick={stopScanning} variant="outline">
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  );
}
