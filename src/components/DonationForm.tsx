"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import NumberFlow from "@number-flow/react";

export default function DonationForm() {
  const [donationAmount, setDonationAmount] = useState<number>(1);
  const [sliderValue, setSliderValue] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slider settings
  const minAmount = 1;
  const maxAmount = 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    setDonationAmount(value);
  };

  const handleSubmit = async () => {
    if (!donationAmount || donationAmount <= 0) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement actual donation logic here
      console.log(`Donating ${donationAmount} USDC`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset form after successful donation
      setDonationAmount(1);
      setSliderValue(1);
      alert(
        `Successfully donated ${donationAmount} USDC! Thank you for your contribution.`
      );
    } catch (error) {
      console.error("Donation failed:", error);
      alert("Donation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidAmount = donationAmount && donationAmount > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Support Our Mission
        </h1>
        <p className="text-lg text-balance text-gray-600 dark:text-gray-400">
          Help us maintain trails and support the hiking community
        </p>
      </div>

      <Card className="border border-gray-200 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="space-y-6">
          {/* Amount Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Amount (USDC)
            </label>
            <div className="space-y-4">
              {/* Current Amount Display with Animation */}
              <div className="text-center text-6xl font-semibold">
                <AnimatePresence mode="wait">
                  <NumberFlow
                    value={donationAmount}
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider dark:bg-gray-700"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                      ((sliderValue - minAmount) / (maxAmount - minAmount)) *
                      100
                    }%, #e5e7eb ${
                      ((sliderValue - minAmount) / (maxAmount - minAmount)) *
                      100
                    }%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>${minAmount}</span>
                  <span>${maxAmount}</span>
                </div>
              </div>
            </div>
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
                  ~${(donationAmount + 0.01).toFixed(2)} USDC
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
              `Donate ${isValidAmount ? `$${donationAmount}` : ""} USDC`
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
  );
}
