"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Mountain,
  Heart,
  DollarSign,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function DonatePage() {
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset amounts in USDC
  const presetAmounts = [1, 5, 10];

  const handlePresetClick = (amount: number) => {
    setDonationAmount(amount.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setDonationAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual donation logic here
      console.log(`Donating ${donationAmount} USDC`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form after successful donation
      setDonationAmount("");
      alert(`Successfully donated ${donationAmount} USDC! Thank you for your contribution.`);
    } catch (error) {
      console.error("Donation failed:", error);
      alert("Donation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidAmount = donationAmount && parseFloat(donationAmount) > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/hiker" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <Mountain className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Framino
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className="text-gray-600 border-gray-300"
              >
                Connected: 0x1234...5678
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Support Our Mission
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Help us maintain trails and support the hiking community
          </p>
        </div>

        <Card className="border border-gray-200 shadow-sm bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-gray-600" />
              Make a Donation
            </CardTitle>
            <CardDescription>
              Your contribution helps maintain trails and support outdoor activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset Amount Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Select Amount (USDC)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {presetAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={donationAmount === amount.toString() ? "default" : "outline"}
                    onClick={() => handlePresetClick(amount)}
                    className={`h-12 text-lg font-semibold ${
                      donationAmount === amount.toString()
                        ? "bg-gray-900 hover:bg-gray-800 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Amount (USDC)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">$</span>
                </div>
                <Input
                  type="text"
                  value={donationAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="pl-8 text-lg h-12 border-gray-300 dark:border-gray-600"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter any amount you&apos;d like to donate
              </p>
            </div>

            {/* Donation Summary */}
            {isValidAmount && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Donation Amount:
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${donationAmount} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Network Fee:
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    ~$0.01 USDC
                  </span>
                </div>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ~${(parseFloat(donationAmount) + 0.01).toFixed(2)} USDC
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isValidAmount || isSubmitting}
              className={`w-full h-12 text-lg font-semibold ${
                !isValidAmount || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Donate ${isValidAmount ? `$${donationAmount}` : ''} USDC`
              )}
            </Button>

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                How your donation helps:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Trail maintenance and improvements</li>
                <li>• Safety equipment and signage</li>
                <li>• Community hiking programs</li>
                <li>• Environmental conservation efforts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
