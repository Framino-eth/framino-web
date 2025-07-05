"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CameraScanner } from "@/components/CameraScannerNew";
import { 
  QrCode,
  Heart,
  CheckCircle,
  AlertCircle,
  Coins,
  Gift
} from "lucide-react";
import NumberFlow from "@number-flow/react";

interface DonationInfo {
  organization: string;
  amount: number;
  currency: string;
  description: string;
  beneficiary: string;
  qrId: string | null;
}

export default function QRDonationScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [donationInfo, setDonationInfo] = useState<DonationInfo | null>(null);
  const [processingDonation, setProcessingDonation] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(20);
  const [sliderValue, setSliderValue] = useState<number>(20);

  // Slider settings
  const minAmount = 1;
  const maxAmount = 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    setCustomAmount(value);
  };

  // Mock donation data that would come from QR code
  const mockDonationData = {
    organization: "Trail Maintenance Fund",
    amount: 5,
    currency: "USDC",
    description: "Help maintain hiking trails in the area",
    beneficiary: "Mountain Trail Preservation Society",
    qrId: null as string | null
  };

  const handleScanSuccess = (qrData: string) => {
    // In a real app, you'd parse the QR code data to extract donation info
    const donationData = {
      ...mockDonationData,
      qrId: qrData
    };
    setDonationInfo(donationData);
    setIsScanning(false);
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setDonationInfo(null);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleConfirmDonation = async () => {
    setProcessingDonation(true);
    
    try {
      // Simulate donation processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would process the blockchain transaction
      console.log('Processing donation:', { ...donationInfo, amount: customAmount });
      
      // Success - reset state
      setTimeout(() => {
        setDonationInfo(null);
        setProcessingDonation(false);
        setCustomAmount(25);
        setSliderValue(25);
      }, 2000);
      
    } catch (error) {
      console.error('Donation failed:', error);
      setProcessingDonation(false);
    }
  };

  const handleCancelDonation = () => {
    setDonationInfo(null);
    setCustomAmount(25);
    setSliderValue(25);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <QrCode className="h-8 w-8 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Scan to Donate
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Scan QR codes to make instant donations to trail organizations
        </p>
      </div>

      {!isScanning && !donationInfo && (
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              Ready to Scan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Look for QR codes on trail signs, information boards, or donation displays
            </p>
            <Button 
              onClick={handleStartScanning}
              className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
            >
              Start QR Scanner
            </Button>
          </CardContent>
        </Card>
      )}

      {isScanning && (
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <CameraScanner
              onScanSuccess={handleScanSuccess}
              onClose={handleStopScanning}
              isScanning={isScanning}
            />
          </CardContent>
        </Card>
      )}

      {donationInfo && !processingDonation && (
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Donation Opportunity Found
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Info */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>QR Code ID:</strong> {donationInfo.qrId}
              </p>
            </div>

            {/* Donation Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {donationInfo.organization}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {donationInfo.beneficiary}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {donationInfo.description}
                </p>
                
                {/* Amount Selector */}
                <div className="space-y-4">
                  {/* Current Amount Display with Animation */}
                  <div className="text-center text-6xl font-semibold">
                    <AnimatePresence mode="wait">
                      <NumberFlow
                        value={customAmount}
                        format={{
                          style: "currency",
                          currency: "USD",
                          trailingZeroDisplay: "stripIfInteger",
                        }}
                      />
                    </AnimatePresence>
                  </div>

                  {/* Slider */}
                  <div className="px-2">
                    <input
                      type="range"
                      min={minAmount}
                      max={maxAmount}
                      value={sliderValue}
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider dark:bg-gray-600"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                          ((sliderValue - minAmount) / (maxAmount - minAmount)) *
                          100
                        }%, #e5e7eb66 ${
                          ((sliderValue - minAmount) / (maxAmount - minAmount)) *
                          100
                        }%, #e5e7eb66 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>${minAmount}</span>
                      <span>${maxAmount}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Your Donation:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ${customAmount} {donationInfo.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Information */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Your Impact:
                </span>
              </div>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Supports trail safety improvements</li>
                <li>• Helps preserve natural environments</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleCancelDonation}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDonation}
                className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
              >
                <Heart className="h-4 w-4 mr-2" />
                Donate ${customAmount}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {processingDonation && (
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
          <CardContent className="text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Processing Donation...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we process your ${customAmount} donation
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Transaction in progress - do not close this page
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      {!isScanning && !donationInfo && (
        <Card className="mt-6 border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How QR Donation Works
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">1</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find QR codes on trail signs, visitor centers, or park information boards
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">2</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan the QR code to reveal donation details and impact information
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">3</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confirm your donation and it will be processed using your connected wallet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
