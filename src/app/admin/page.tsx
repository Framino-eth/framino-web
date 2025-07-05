"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Mountain,
  Plus,
  Minus,
  ShoppingCart,
  Coffee,
  Droplets,
  Apple,
  Cookie,
  Sandwich,
  IceCream,
  Zap,
  Heart,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { CameraScanner } from "@/components/CameraScannerNew";
import { RedeemButton } from "@/components/RedeemButton";

// Mock shop items data
const shopItems = [
  {
    id: 1,
    name: "Water Bottle",
    price: 2.5,
    category: "Beverages",
    icon: Droplets,
    description: "Refreshing spring water",
    image: "💧",
  },
  {
    id: 2,
    name: "Latte",
    price: 4.75,
    category: "Beverages",
    icon: Coffee,
    description: "Fresh brewed coffee latte",
    image: "☕",
  },
  {
    id: 3,
    name: "Fresh Apple",
    price: 1.25,
    category: "Fruits",
    icon: Apple,
    description: "Organic red apple",
    image: "🍎",
  },
  {
    id: 4,
    name: "Trail Mix Cookies",
    price: 3.0,
    category: "Snacks",
    icon: Cookie,
    description: "Homemade energy cookies",
    image: "🍪",
  },
  {
    id: 5,
    name: "Energy Bar",
    price: 2.25,
    category: "Snacks",
    icon: Zap,
    description: "High protein energy bar",
    image: "🥜",
  },
  {
    id: 6,
    name: "Trail Sandwich",
    price: 6.5,
    category: "Food",
    icon: Sandwich,
    description: "Turkey and avocado sandwich",
    image: "🥪",
  },
  {
    id: 7,
    name: "Orange",
    price: 1.5,
    category: "Fruits",
    icon: Apple,
    description: "Fresh orange",
    image: "🍊",
  },
  {
    id: 8,
    name: "Banana",
    price: 1.0,
    category: "Fruits",
    icon: Apple,
    description: "Ripe banana",
    image: "🍌",
  },
  {
    id: 9,
    name: "Ice Cream",
    price: 4.0,
    category: "Desserts",
    icon: IceCream,
    description: "Vanilla ice cream",
    image: "🍦",
  },
  {
    id: 10,
    name: "Sports Drink",
    price: 3.25,
    category: "Beverages",
    icon: Droplets,
    description: "Electrolyte sports drink",
    image: "🥤",
  },
  {
    id: 11,
    name: "Granola Bar",
    price: 2.75,
    category: "Snacks",
    icon: Zap,
    description: "Oats and honey granola",
    image: "🥣",
  },
  {
    id: 12,
    name: "Hot Chocolate",
    price: 3.5,
    category: "Beverages",
    icon: Coffee,
    description: "Rich hot chocolate",
    image: "☕",
  },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function AdminPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);
  const [scannedBadgeId, setScannedBadgeId] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<
    "scan" | "confirm" | "redeem" | "complete"
  >("scan");
  const [redemptionError, setRedemptionError] = useState<string | null>(null);

  const categories = [
    "All",
    "Beverages",
    "Fruits",
    "Snacks",
    "Food",
    "Desserts",
  ];

  const filteredItems =
    selectedCategory === "All"
      ? shopItems
      : shopItems.filter((item) => item.category === selectedCategory);

  const addToCart = (item: (typeof shopItems)[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [
          ...prevCart,
          { id: item.id, name: item.name, price: item.price, quantity: 1 },
        ];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter((cartItem) => cartItem.id !== itemId);
      }
    });
  };

  const getItemQuantity = (itemId: number) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    setCheckoutDrawerOpen(true);
    setCheckoutStep("scan");
    setScannedBadgeId(null);
    setRedemptionError(null);
  };

  const handleScanSuccess = (badgeId: string) => {
    setScannedBadgeId(badgeId);
    setCheckoutStep("confirm");
  };

  const handleConfirmCheckout = () => {
    setCheckoutStep("redeem");
  };

  const handleRedeemSuccess = () => {
    setCheckoutStep("complete");
    // Clear cart after successful redemption
    setTimeout(() => {
      setCheckoutDrawerOpen(false);
      setCart([]);
      setCheckoutStep("scan");
      setScannedBadgeId(null);
      setRedemptionError(null);
    }, 3000);
  };

  const handleRedeemError = (error: string) => {
    setRedemptionError(error);
    // Optionally go back to confirm step or stay on redeem step
  };

  const handleCloseDrawer = () => {
    setCheckoutDrawerOpen(false);
    setCheckoutStep("scan");
    setScannedBadgeId(null);
    setRedemptionError(null);
  };

  const clearCart = () => {
    setCart([]);
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
                  Shop Admin
                </Badge>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              <WalletConnectButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shop Items selection
          </h1>
          <p className="text-lg text-balance text-gray-600 dark:text-gray-400 mb-6">
            Select items for hikers to redeem with their badges
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 px-12 lg;p-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-4xl! cursor-pointer ${
                  selectedCategory === category
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
          {filteredItems.map((item) => {
            const quantity = getItemQuantity(item.id);

            return (
              <Card
                key={item.id}
                className="border border-gray-200 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-500 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-2">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{item.image}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                      ${item.price.toFixed(2)}
                    </div>

                    <div className="flex items-center space-x-2">
                      {quantity > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}

                      {quantity > 0 && (
                        <span className="min-w-[2rem] text-center font-medium text-gray-900 dark:text-white">
                          {quantity}
                        </span>
                      )}

                      <Button
                        variant={quantity > 0 ? "outline" : "default"}
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sticky Checkout Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Cart Summary (shown when there are items) */}
          {cart.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cart Summary:
              </h4>
              <div className="flex flex-wrap gap-2">
                {cart.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-600 text-xs rounded border border-gray-200 dark:border-gray-500"
                  >
                    {item.quantity}x {item.name}
                    <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between flex-col lg:flex-row gap-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${getTotalPrice().toFixed(2)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {cart.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="text-gray-600 border-gray-300 dark:text-gray-300 dark:border-gray-400 cursor-pointer"
                >
                  Clear Cart
                </Button>
              )}
              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`py-2 font-semibold cursor-pointer ${
                  cart.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                    : "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                }`}
              >
                Redeem for Hiker
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Drawer */}
      <Drawer open={checkoutDrawerOpen} onOpenChange={setCheckoutDrawerOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle>
              {checkoutStep === "scan" && "Scan Hiker Badge"}
              {checkoutStep === "confirm" && "Confirm Redemption"}
              {checkoutStep === "redeem" && "Blockchain Redemption"}
              {checkoutStep === "complete" && "Redemption Complete"}
            </DrawerTitle>
            <DrawerDescription>
              {checkoutStep === "scan" &&
                "Scan the hiker's badge to verify their identity"}
              {checkoutStep === "confirm" &&
                "Review the items and confirm the redemption"}
              {checkoutStep === "redeem" &&
                "Processing blockchain transaction for item redemption"}
              {checkoutStep === "complete" &&
                "Items have been successfully redeemed"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-6">
            {checkoutStep === "scan" && (
              <CameraScanner
                onScanSuccess={handleScanSuccess}
                onClose={handleCloseDrawer}
                isScanning={checkoutDrawerOpen}
              />
            )}

            {checkoutStep === "confirm" && (
              <div className="space-y-6">
                {/* Badge Info */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Hiker Badge Verified
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Badge ID: {scannedBadgeId}
                  </p>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Redemption Summary
                  </h4>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Total: {getTotalItems()} items
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setCheckoutStep("scan")}
                    className="flex-1"
                  >
                    Back to Scan
                  </Button>
                  <Button
                    onClick={handleConfirmCheckout}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                  >
                    Proceed to Blockchain Redemption
                  </Button>
                </div>
              </div>
            )}

            {checkoutStep === "redeem" && scannedBadgeId && (
              <div className="space-y-6">
                {/* Badge Info */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Hiker Badge Verified
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Badge ID: {scannedBadgeId}
                  </p>
                </div>

                {/* Redemption Error */}
                {redemptionError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Redemption Failed
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {redemptionError}
                    </p>
                  </div>
                )}

                {/* Blockchain Redemption Component */}
                <RedeemButton
                  tokenId={scannedBadgeId}
                  totalAmount={getTotalPrice()}
                  cartItems={cart}
                  onRedeemSuccess={handleRedeemSuccess}
                  onRedeemError={handleRedeemError}
                />

                {/* Back Button */}
                <Button
                  variant="outline"
                  onClick={() => setCheckoutStep("confirm")}
                  className="w-full"
                >
                  Back to Confirmation
                </Button>
              </div>
            )}

            {checkoutStep === "complete" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Redemption Successful!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The hiker can now collect their items
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {getTotalItems()} items redeemed for Badge {scannedBadgeId}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Total value: ${getTotalPrice().toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
