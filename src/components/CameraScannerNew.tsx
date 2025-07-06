"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Camera, AlertCircle, QrCode, Heart, Gift, Award, Download, Image as ImageIcon } from "lucide-react";

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
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{id: string, data: string, image: string, timestamp: Date}>>([]);
  const codeReader = useRef(new BrowserMultiFormatReader());
  
  // Get connected wallet address
  const { address, isConnected } = useAccount();

  // Mode-specific configuration
  const getModeConfig = () => {
    // Use connected wallet address or fallback to mock address
    const walletAddress = isConnected && address ? address : "0x1234...5678";
    
    switch (mode) {
      case "hiker":
        return {
          title: "Scan Donation QR Code",
          instruction: "Point camera at donation QR code on trail signs",
          scanningText: "Scanning for donation opportunity...",
          successText: "Donation QR Found!",
          icon: Heart,
          color: "green",
          mockData: `DONATION_TRAIL_001_$5_USDC_${walletAddress}`
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
            walletAddress: walletAddress,
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
            walletAddress: walletAddress,
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
          mockData: `GENERIC_QR_CODE_${walletAddress}`
        };
    }
  };

  const config = getModeConfig();

  // Check camera permissions and availability
  useEffect(() => {
    const checkCameraPermissions = async () => {
      try {
        console.log('🔍 Checking camera permissions...');
        
        // Check if navigator.mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('❌ Camera API not supported in this browser');
          setError('Camera not supported in this browser');
          setPermissionStatus('not-supported');
          return;
        }

        // Check permission status
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          console.log('🔐 Camera permission status:', permission.state);
          setPermissionStatus(permission.state);
          
          if (permission.state === 'denied') {
            setError('Camera access denied. Please enable camera permissions in your browser settings.');
            return;
          }
        }

        // Test camera access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: "environment",
              width: { ideal: 400 },
              height: { ideal: 400 }
            } 
          });
          console.log('✅ Camera access granted');
          setCameraReady(true);
          setPermissionStatus('granted');
          // Stop the test stream
          stream.getTracks().forEach(track => track.stop());
        } catch (cameraError) {
          console.error('❌ Camera access failed:', cameraError);
          if (cameraError instanceof Error) {
            if (cameraError.name === 'NotAllowedError') {
              setError('Camera access denied. Please allow camera access and refresh the page.');
            } else if (cameraError.name === 'NotFoundError') {
              setError('No camera found. Please connect a camera and refresh the page.');
            } else if (cameraError.name === 'NotReadableError') {
              setError('Camera is being used by another application. Please close other camera apps.');
            } else {
              setError(`Camera error: ${cameraError.message}`);
            }
          } else {
            setError('Unknown camera error occurred.');
          }
          setPermissionStatus('denied');
        }
      } catch (err) {
        console.error('❌ Permission check failed:', err);
        setError('Failed to check camera permissions');
        setPermissionStatus('error');
      }
    };

    checkCameraPermissions();
  }, []);

  // Function to download the scanned image
  const downloadImage = useCallback((imageDataUrl: string, qrData: string) => {
    try {
      const link = document.createElement('a');
      link.download = `qr-scan-${mode}-${Date.now()}.jpg`;
      link.href = imageDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('💾 Image saved:', link.download);
      console.log('📸 QR Data in image:', qrData);
    } catch (err) {
      console.error('❌ Failed to download image:', err);
    }
  }, [mode]);

  // Real QR code scanning using ZXing library
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isScanning && scanning) {
      console.log(`🎥 Starting QR scanner in ${mode} mode...`);
      
      intervalId = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            // console.log('📸 Taking screenshot for QR analysis...');
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
                    // console.log(`🖼️ Created canvas: ${canvas.width}x${canvas.height}`);
                    
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
                            
                            // Save the image when QR is found
                            const imageDataUrl = imageSrc;
                            setScannedImage(imageDataUrl);
                            
                            // Add to scan history
                            const scanEntry = {
                              id: Date.now().toString(),
                              data: qrData,
                              image: imageDataUrl,
                              timestamp: new Date()
                            };
                            setScanHistory(prev => [scanEntry, ...prev.slice(0, 4)]); // Keep last 5 scans
                            
                            // Auto-download the image
                            downloadImage(imageDataUrl, qrData);
                            
                            setScanResult(qrData);
                            setScanning(false);
                            setError(null);
                            onScanSuccess(qrData);
                          }
                        } catch (decodeError) {
                          // More detailed error logging for debugging
                          if (decodeError instanceof Error) {
                            // console.log('❌ QR decode failed:', decodeError.message);
                          } else {
                            // console.log('⚠️ No QR code found in this frame');
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
      }, 3000); // Scan every second
    } else {
      console.log('⏹️ Scanner stopped or not active');
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isScanning, scanning, onScanSuccess, mode, downloadImage]);

  const startScanning = () => {
    console.log('🚀 START SCANNING BUTTON CLICKED');
    console.log('🎯 Mode:', mode);
    console.log('📹 Camera ready:', cameraReady);
    console.log('🔐 Permission status:', permissionStatus);
    
    if (!cameraReady) {
      setError('Camera not ready. Please check permissions and refresh the page.');
      return;
    }
    
    setScanning(true);
    setError(null);
    setScanResult(null);
  };

  const stopScanning = () => {
    console.log('🛑 STOP SCANNING BUTTON CLICKED');
    setScanning(false);
  };

  // Webcam event handlers
  const handleWebcamReady = () => {
    console.log('📹 Webcam is ready and streaming');
    setCameraReady(true);
    setError(null);
  };

  const handleWebcamError = (error: string | DOMException) => {
    console.error('📹 Webcam error:', error);
    setCameraReady(false);
    
    if (typeof error === 'string') {
      setError(`Webcam error: ${error}`);
    } else if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          setError('Camera access denied. Please allow camera access in your browser.');
          break;
        case 'NotFoundError':
          setError('No camera found. Please connect a camera.');
          break;
        case 'NotReadableError':
          setError('Camera is busy. Please close other camera applications.');
          break;
        default:
          setError(`Camera error: ${error.message}`);
      }
    } else {
      setError('Unknown webcam error occurred.');
    }
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

  // Manual save function for the current scanned image
  const saveCurrentImage = () => {
    if (scannedImage && scanResult) {
      downloadImage(scannedImage, scanResult);
    }
  };

  // Clear scan history
  const clearScanHistory = () => {
    setScanHistory([]);
    console.log('🗑️ Scan history cleared');
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
      {/* Wallet Connection Status */}
      {/* <div className={`p-3 rounded-lg border ${
        isConnected 
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-yellow-500"
          }`}></div>
          <span className={`text-sm font-medium ${
            isConnected 
              ? "text-green-800 dark:text-green-200" 
              : "text-yellow-800 dark:text-yellow-200"
          }`}>
            {isConnected ? "Wallet Connected" : "Wallet Not Connected"}
          </span>
        </div>
        {isConnected && address && (
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Using address: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
        {!isConnected && (
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Mock data will use placeholder address
          </p>
        )}
      </div> */}

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
            onUserMedia={handleWebcamReady}
            onUserMediaError={handleWebcamError}
          />

          {/* Camera status indicator */}
          {!cameraReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white bg-black/70 p-4 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Initializing camera...</p>
              </div>
            </div>
          )}

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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <IconComponent className={`h-5 w-5 ${colors.icon}`} />
              <span className={`text-sm font-medium ${colors.text}`}>
                {config.successText}
              </span>
            </div>
            {scannedImage && (
              <Button
                onClick={saveCurrentImage}
                variant="outline"
                size="sm"
                className="h-8 px-2"
              >
                <Download className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <p className={`text-xs ${colors.text} opacity-75`}>
              QR Data: {scanResult.length > 50 ? `${scanResult.substring(0, 50)}...` : scanResult}
            </p>
            
            {/* Show the scanned image */}
            {scannedImage && (
              <div className="border rounded-lg p-2 bg-white dark:bg-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Scanned Image:</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={scannedImage} 
                  alt="Scanned QR Code" 
                  className="w-full max-w-xs mx-auto rounded border"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
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
              disabled={!cameraReady}
            >
              <Camera className="h-4 w-4 mr-2" />
              {cameraReady ? 'Start Scanning' : 'Camera Loading...'}
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

      {/* Camera Status Info */}
      {permissionStatus !== 'unknown' && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Camera: {permissionStatus} | Ready: {cameraReady ? 'Yes' : 'No'}
          </p>
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Recent Scans ({scanHistory.length})
            </h3>
            <Button
              onClick={clearScanHistory}
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
            >
              Clear
            </Button>
          </div>
          <div className="space-y-2">
            {scanHistory.slice(0, 3).map((scan) => (
              <div key={scan.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-700 rounded border">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={scan.image} 
                    alt="Scan thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {scan.data.length > 30 ? `${scan.data.substring(0, 30)}...` : scan.data}
                  </p>
                  <p className="text-xs text-gray-400">
                    {scan.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  onClick={() => downloadImage(scan.image, scan.data)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
