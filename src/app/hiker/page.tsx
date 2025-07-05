"use client";

import { useState } from "react";
import Link from "next/link";
import { Mountain, MapPin, Award, QrCode, Settings } from "lucide-react";
import MapSection from "@/components/MapSection";
import BadgeGallery from "@/components/BadgeGallery";
import QRDonationScanner from "@/components/QRDonationScanner";
// import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export default function HikerPage() {
  const [activeTab, setActiveTab] = useState<
    "map" | "badges" | "donate" | "scan"
  >("map");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Mountain className="h-8 w-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Framino
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              {/* <Link
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center space-x-1 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Shop Admin</span>
              </Link> */}
              <WalletConnectButton />
              {/* <ThemeToggle /> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-4 pt-1 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setActiveTab("map")}
              className={`py-3 px-3 border-b-2 font-medium text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 ${
                activeTab === "map"
                  ? "border-gray-900 text-gray-900 dark:border-gray-300 dark:text-gray-100"
                  : "border-transparent text-gray-500 hover:text-gray-400 hover:dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-1" />
              Map & Shops
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              className={`py-3 px-3 border-b-2 font-medium text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 ${
                activeTab === "badges"
                  ? "border-gray-900 text-gray-900 dark:border-gray-300 dark:text-gray-100"
                  : "border-transparent text-gray-500 hover:text-gray-400 hover:dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              <Award className="h-4 w-4 inline mr-1" />
              Badges
            </button>
            {/* <button
              onClick={() => setActiveTab("donate")}
              className={`py-3 px-3 border-b-2 font-medium text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 ${
                activeTab === "donate"
                  ? "border-gray-900 text-gray-900 dark:border-gray-300 dark:text-gray-100"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              <Heart className="h-4 w-4 inline mr-1" />
              Donate
            </button> */}
            <button
              onClick={() => setActiveTab("scan")}
              className={`py-3 px-3 border-b-2 font-medium text-sm cursor-pointer transition whitespace-nowrap flex-shrink-0 ${
                activeTab === "scan"
                  ? "border-gray-900 text-gray-900 dark:border-gray-300 dark:text-gray-100"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:dark:text-gray-400 hover:border-gray-300"
              }`}
            >
              <QrCode className="h-4 w-4 inline mr-1" />
              Scan
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-8 lg:pt-12">
        {activeTab === "map" ? (
          <MapSection />
        ) : activeTab === "badges" ? (
          <BadgeGallery />
        ) : (
          <QRDonationScanner />
        )}
      </div>
    </div>
  );
}
