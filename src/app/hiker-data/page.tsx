/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Mountain, 
  Wallet, 
  Trophy, 
  MapPin, 
  CheckCircle, 
  Clock,
  Search,
  Loader2,
  ExternalLink
} from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useAccount } from "wagmi";
import { readContracts } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import FraminoNFTABI from "@/lib/abi/FraminoNFT.json";
import { Abi } from "viem";

interface NFTData {
  tokenId: number;
  balance: number;
  isCompleted: boolean;
  uri: string;
  customUri?: string;
}

interface HikerStats {
  totalNFTs: number;
  completedTrails: number;
  pendingTrails: number;
  totalBalance: number;
}

export default function HikerDataPage() {
  const { address, isConnected } = useAccount();
  const [searchAddress, setSearchAddress] = useState("");
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [hikerStats, setHikerStats] = useState<HikerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_FRAMINO_NFT_CONTRACT_ADDRESS || "0x73050b11f0Dd5C48Ed1C05c56236F0D235ba4f57";

  // Auto-query when wallet connects
  useEffect(() => {
    if (isConnected && address && !targetAddress) {
      setTargetAddress(address);
      queryHikerData(address);
    }
  }, [isConnected, address, targetAddress]);

  const queryHikerData = async (walletAddress: string) => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Query all possible NFT IDs (0-7 based on your contract)
      const tokenIds = [0, 1, 2, 3, 4, 5, 6, 7];
      
      // Prepare batch contract calls
      const balanceCalls = tokenIds.map(id => ({
        address: contractAddress as `0x${string}`,
        abi: FraminoNFTABI as Abi,
        functionName: 'getBalance',
        args: [walletAddress, id],
      }));

      const completedCalls = tokenIds.map(id => ({
        address: contractAddress as `0x${string}`,
        abi: FraminoNFTABI as Abi,
        functionName: 'isCompleted',
        args: [walletAddress, id],
      }));

      const uriCalls = tokenIds.map(id => ({
        address: contractAddress as `0x${string}`,
        abi: FraminoNFTABI as Abi,
        functionName: 'getUserTokenURI',
        args: [walletAddress, id],
      }));

      const customUriCalls = tokenIds.map(id => ({
        address: contractAddress as `0x${string}`,
        abi: FraminoNFTABI as Abi,
        functionName: 'customURIs',
        args: [walletAddress, id],
      }));

      // Execute all calls
      const [balances, completedStatus, uris, customUris] = await Promise.all([
        readContracts(config, { contracts: balanceCalls }),
        readContracts(config, { contracts: completedCalls }),
        readContracts(config, { contracts: uriCalls }),
        readContracts(config, { contracts: customUriCalls }),
      ]);

      // Process results
      const nftResults: NFTData[] = [];
      let totalBalance = 0;
      let completedCount = 0;

      tokenIds.forEach((tokenId, index) => {
        const balance = balances[index].result as number || 0;
        const isCompleted = completedStatus[index].result as boolean || false;
        const uri = uris[index].result as string || "";
        const customUri = customUris[index].result as string || "";

        if (balance > 0) {
          nftResults.push({
            tokenId,
            balance,
            isCompleted,
            uri,
            customUri: customUri || undefined,
          });

          totalBalance += balance;
          if (isCompleted) completedCount++;
        }
      });

      setNftData(nftResults);
      setHikerStats({
        totalNFTs: nftResults.length,
        completedTrails: completedCount,
        pendingTrails: nftResults.length - completedCount,
        totalBalance,
      });

    } catch (err) {
      console.error('Error querying hiker data:', err);
      setError(err instanceof Error ? err.message : 'Failed to query blockchain data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchAddress.trim()) return;
    
    // Basic address validation
    if (!searchAddress.startsWith('0x') || searchAddress.length !== 42) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setTargetAddress(searchAddress);
    queryHikerData(searchAddress);
  };

  const handleUseConnectedWallet = () => {
    if (address) {
      setSearchAddress(address);
      setTargetAddress(address);
      queryHikerData(address);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#f2eee7] dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-[#f2eee7]/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Mountain className="h-8 w-8 text-gray-700 dark:text-gray-300" />
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Framino
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  Hiker Data
                </Badge>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Hiker Data Explorer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Query NFT holdings, completion status, and trail metadata for any hiker
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Hiker Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter wallet address (0x...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>
            
            {isConnected && address && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Connected: {formatAddress(address)}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleUseConnectedWallet}
                  className="text-green-700 border-green-300"
                >
                  Use My Wallet
                </Button>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        {hikerStats && targetAddress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {hikerStats.totalNFTs}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total NFTs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {hikerStats.completedTrails}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {hikerStats.pendingTrails}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {hikerStats.totalBalance}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hiker Address Display */}
        {targetAddress && (
          <Card className="mb-8 border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Querying Data For:
                  </h3>
                  <p className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all">
                    {targetAddress}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.arbiscan.io/address/${targetAddress}`, '_blank')}
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View on Explorer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NFT Data Grid */}
        {nftData.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              NFT Holdings & Trail Data
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nftData.map((nft) => (
                <Card key={nft.tokenId} className="border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Trail #{nft.tokenId}</CardTitle>
                      <Badge 
                        variant={nft.isCompleted ? "default" : "secondary"}
                        className={nft.isCompleted ? "bg-green-600 text-white" : ""}
                      >
                        {nft.isCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Balance:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {nft.balance}
                      </span>
                    </div>
                    
                    {nft.uri && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">URI:</span>
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-500 break-all bg-gray-50 dark:bg-gray-700 p-2 rounded mt-1">
                          {nft.uri}
                        </p>
                      </div>
                    )}
                    
                    {nft.customUri && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Custom URI:</span>
                        <p className="text-xs font-mono text-blue-600 dark:text-blue-400 break-all bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-1">
                          {nft.customUri}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-sm">
                        {nft.isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600 mr-2" />
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {nft.isCompleted ? "Trail completed" : "Trail in progress"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {targetAddress && !loading && nftData.length === 0 && !error && (
          <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No NFTs Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This address doesn&apos;t own any Framino NFTs yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="border border-gray-300 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Loading Hiker Data...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Querying blockchain for NFT holdings and metadata
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
