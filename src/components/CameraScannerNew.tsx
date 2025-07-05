"use client";

import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle, AlertCircle, QrCode } from "lucide-react";

interface CameraScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
  isScanning: boolean;
}

export function CameraScanner({
  onScanSuccess,
  isScanning,
}: CameraScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulate QR code scanning (in a real app, you'd use actual QR scanning)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isScanning && scanning) {
      // Simulate scanning delay
      timeoutId = setTimeout(() => {
        // Simulate successful scan with a mock badge ID
        const mockBadgeId = `BADGE_${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;
        setScanResult(mockBadgeId);
        setScanning(false);
        onScanSuccess(mockBadgeId);
      }, 3000); // 3 second delay to simulate scanning
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isScanning, scanning, onScanSuccess]);

  const startScanning = () => {
    setScanning(true);
    setError(null);
    setScanResult(null);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  // Mock scan for demo purposes
  const mockScan = () => {
    const mockBadgeId = `BADGE_${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
    setScanResult(mockBadgeId);
    setScanning(false);
    onScanSuccess(mockBadgeId);
  };

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
              <div className="w-48 h-48 border-2 border-green-400 rounded-lg animate-pulse">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
              </div>
            </div>
          )}

          {/* Demo QR code indicator */}
          {!scanning && !scanResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white bg-black/50 p-4 rounded-lg">
                <QrCode className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Point camera at QR code</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
          {scanning
            ? "Scanning for QR code... Point camera at hiker's badge"
            : "Position the hiker's badge QR code within the camera view"}
        </p>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Badge Scanned Successfully
            </span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Badge ID: {scanResult}
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
            <Button onClick={mockScan} variant="outline" className="text-xs">
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
