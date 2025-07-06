import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Trophy, Users } from "lucide-react";
import Link from "next/link";
import bgImage from "@/assets/bg.png";
import logoImage from "@/assets/logo.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f2eee7] dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-[#f2eee7]/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src={logoImage.src} className="h-10 w-10 "></img>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Framino
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/hiker">
                <Button
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-56">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bgImage.src})`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50 dark:bg-black/50"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
              Framino,{" "}
              <span className="text-gray-200">Web3 Camino Application</span>
            </h1>
            <p className="text-3xl font-medium text-gray-200 max-w-3xl mx-auto mb-8">
              Framino provides seamless Payment by leveraging <br></br>
              <strong>Circle Paymaster</strong> in Camino journey.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-[#f2eee7] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Framino?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Combining the love of hiking with blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <Trophy className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle>Earn Rewards</CardTitle>
                <CardDescription>
                  Complete hiking challenges and earn crypto tokens for your
                  achievements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <Users className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle>Join Community</CardTitle>
                <CardDescription>
                  Connect with fellow hikers, share experiences, and discover
                  new trails together
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <MapPin className="h-12 w-12 text-gray-600 mb-4" />
                <CardTitle>Verified Trails</CardTitle>
                <CardDescription>
                  Access curated, community-verified hiking trails with detailed
                  information
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-[#f2eee7] dark:bg-gray-800 text-gray-700 dark:text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={logoImage.src} className="h-10 w-10 "></img>
              <span className="font-semibold text-gray-700 dark:text-white">Framino</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              © 2025 Framino. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
