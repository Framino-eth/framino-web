/* eslint-disable @typescript-eslint/no-explicit-any */
// Update the import path or file name to match the actual file location and casing
import {
  NftMarkCompletedRequest,
  NftMintRequest,
  NftRedeemRequest,
} from "../models/framinoModel";
import { ethers } from "ethers";
import "dotenv/config";
import {
  erc20Abi,
  encodePacked,
  http,
  getContract,
  createPublicClient,
  hexToBigInt,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  createBundlerClient,
  toSimple7702SmartAccount,
} from "viem/account-abstraction";
import FraminoNFTAbi from "../abi/FraminoNFT.json";

import { signPermit } from "../services/permitService";
// Update the import path or file name to match the actual file location and casing
import { DonateRequest } from "../models/framinoModel";

/**
 * FraminoService provides methods to interact with NFTs and perform USDC donations.
 */
// Note: This service is designed to work with the Sepolia testnet.
export class FraminoService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    const providerUrl = process.env.PROVIDER_URL!;
    const privateKey = process.env.CONTRACT_OWNER_PRIVATE_KEY!;
    const contractAddress = process.env.FRAMINO_NFT_CONTRACT_ADDRESS!;

    this.provider = new ethers.JsonRpcProvider(providerUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      contractAddress,
      FraminoNFTAbi,
      this.wallet
    );
  }

  public async donateUSDCWithPaymasterService(
    body: DonateRequest
  ): Promise<{ txHash: string }> {
    // 1. Load environment variables and parameters
    const chain = arbitrumSepolia; // Use Sepolia testnet
    const usdcAddress = process.env.USDC_ADDRESS as `0x${string}`;
    const paymasterAddress = process.env.PAYMASTER_V08_ADDRESS as `0x${string}`;
    const senderPrivateKey = process.env.SENDER_PRIVATE_KEY as `0x${string}`;

    // 2. Create viem clients
    const client = createPublicClient({ chain, transport: http() });
    const owner = privateKeyToAccount(senderPrivateKey);

    // 3. Get the smart account (EIP-7702)
    const account = await toSimple7702SmartAccount({ client, owner });

    // 4. Get USDC contract
    const usdc = getContract({ client, address: usdcAddress, abi: erc20Abi });

    // 5. Check USDC balance
    const usdcBalance = await usdc.read.balanceOf([account.address]);
    const amount = BigInt(Math.floor(Number(body.amount) * 1e6)); // USDC uses 6 decimals

    if (usdcBalance < amount) {
      throw new Error(
        `Insufficient USDC balance. Please fund ${account.address}`
      );
    }

    // 6. Sign permit
    const paymaster = {
      async getPaymasterData() {
        const permitAmount = hexToBigInt("0x100000000");
        const permitSignature = await signPermit({
          tokenAddress: usdcAddress,
          account,
          client,
          spenderAddress: paymasterAddress,
          permitAmount: permitAmount,
        });

        const paymasterData = encodePacked(
          ["uint8", "address", "uint256", "bytes"],
          [0, usdcAddress, permitAmount, permitSignature]
        );

        return {
          paymaster: paymasterAddress,
          paymasterData,
          paymasterVerificationGasLimit: hexToBigInt("0x200000"),
          paymasterPostOpGasLimit: hexToBigInt("0x15000"),
          isFinal: true,
        };
      },
    };

    // 7. Encode paymasterData
    const bundlerClient = createBundlerClient({
      account,
      client,
      paymaster,
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          const fees = await bundlerClient.request({
            method: "pimlico_getUserOperationGasPrice" as any,
          });
          if (
            typeof fees === "object" &&
            fees !== null &&
            "standard" in fees &&
            typeof (fees as any).standard === "object"
          ) {
            const maxFeePerGas = hexToBigInt(
              (fees as any).standard.maxFeePerGas
            );
            const maxPriorityFeePerGas = hexToBigInt(
              (fees as any).standard.maxPriorityFeePerGas
            );

            return { maxFeePerGas, maxPriorityFeePerGas };
          } else {
            throw new Error(
              "Unexpected response from pimlico_getUserOperationGasPrice: " +
                JSON.stringify(fees)
            );
          }
        },
      },
      transport: http(`https://public.pimlico.io/v2/${client.chain.id}/rpc`),
    });

    const recipientAddress = process.env.RECIPIENT_ADDRESS as `0x${string}`;
    if (!recipientAddress) {
      throw new Error("RECIPIENT_ADDRESS environment variable is not set");
    }

    // 8. Sign authorization for 7702 account
    const authorization = await owner.signAuthorization({
      chainId: chain.id,
      nonce: await client.getTransactionCount({ address: owner.address }),
      contractAddress: account.authorization.address,
    });

    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: usdc.address,
          abi: usdc.abi,
          functionName: "transfer",
          args: [recipientAddress, amount],
        },
      ],
      authorization: authorization,
    });
    console.log("UserOperation hash", hash);

    const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });
    console.log("Transaction hash", receipt.receipt.transactionHash);

    return { txHash: receipt.receipt.transactionHash };
  }

  public async mintNftWithPaymasterService(
    body: NftMintRequest
  ): Promise<{ txHash: string }> {
    const chain = arbitrumSepolia;
    const paymasterAddress = process.env.PAYMASTER_V08_ADDRESS as `0x${string}`;
    const contractAddress = process.env
      .FRAMINO_NFT_CONTRACT_ADDRESS as `0x${string}`;
    const ownerPrivateKey = process.env
      .CONTRACT_OWNER_PRIVATE_KEY as `0x${string}`;
    const usdcAddress = process.env.USDC_ADDRESS as `0x${string}`;

    // 1. Create viem client
    const client = createPublicClient({ chain, transport: http() });
    const owner = privateKeyToAccount(ownerPrivateKey);

    // 2. Get the owner's smart account (4337 wallet)
    const account = await toSimple7702SmartAccount({ client, owner });

    // 3. Set up the paymaster
    const paymaster = {
      async getPaymasterData() {
        const permitAmount = hexToBigInt("0x100000000");
        const permitSignature = await signPermit({
          tokenAddress: usdcAddress,
          account,
          client,
          spenderAddress: paymasterAddress,
          permitAmount: permitAmount,
        });

        const paymasterData = encodePacked(
          ["uint8", "address", "uint256", "bytes"],
          [0, usdcAddress, permitAmount, permitSignature]
        );

        return {
          paymaster: paymasterAddress,
          paymasterData,
          paymasterVerificationGasLimit: hexToBigInt("0x200000"),
          paymasterPostOpGasLimit: hexToBigInt("0x15000"),
          isFinal: true,
        };
      },
    };

    // 4. Create the bundler client
    const bundlerClient = createBundlerClient({
      account,
      client,
      paymaster,
      userOperation: {
        estimateFeesPerGas: async ({
          bundlerClient,
        }) => {
          const fees = await bundlerClient.request({
            method: "pimlico_getUserOperationGasPrice" as any,
          });
          if (
            typeof fees === "object" &&
            fees !== null &&
            "standard" in fees &&
            typeof (fees as any).standard === "object"
          ) {
            const maxFeePerGas = hexToBigInt(
              (fees as any).standard.maxFeePerGas
            );
            const maxPriorityFeePerGas = hexToBigInt(
              (fees as any).standard.maxPriorityFeePerGas
            );

            return { maxFeePerGas, maxPriorityFeePerGas };
          } else {
            throw new Error(
              "Unexpected response from pimlico_getUserOperationGasPrice: " +
                JSON.stringify(fees)
            );
          }
        },
      },
      transport: http(`https://public.pimlico.io/v2/${client.chain.id}/rpc`),
    });

    // 5. Prepare the mint call
    const { account: to, id, value, uri } = body;
    const data = "0x";

    // 6. Sign authorization for the smart account
    const authorization = await owner.signAuthorization({
      chainId: chain.id,
      nonce: await client.getTransactionCount({ address: owner.address }),
      contractAddress: account.authorization.address,
    });

    // 7. Send the mint transaction as a UserOperation
    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: contractAddress,
          abi: FraminoNFTAbi,
          functionName: "mint",
          args: [to, id, value, uri, data],
        },
      ],
      authorization: authorization,
    });
    console.log("OwnerOperation hash", hash);

    const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });
    console.log("Transaction hash", receipt.receipt.transactionHash);

    return { txHash: receipt.receipt.transactionHash };
  }

  public async markCompletedWithPaymasterService(
    body: NftMarkCompletedRequest
  ): Promise<{ txHash: string }> {
    const chain = arbitrumSepolia;
    const paymasterAddress = process.env.PAYMASTER_V08_ADDRESS as `0x${string}`;
    const contractAddress = process.env
      .FRAMINO_NFT_CONTRACT_ADDRESS as `0x${string}`;
    const ownerPrivateKey = process.env
      .CONTRACT_OWNER_PRIVATE_KEY as `0x${string}`;
    const usdcAddress = process.env.USDC_ADDRESS as `0x${string}`;

    // 1. Create viem client
    const client = createPublicClient({ chain, transport: http() });
    const owner = privateKeyToAccount(ownerPrivateKey);

    // 2. Get the owner's smart account (4337 wallet)
    const account = await toSimple7702SmartAccount({ client, owner });

    // 3. Set up the paymaster
    const paymaster = {
      async getPaymasterData() {
        const permitAmount = hexToBigInt("0x100000000");
        const permitSignature = await signPermit({
          tokenAddress: usdcAddress,
          account,
          client,
          spenderAddress: paymasterAddress,
          permitAmount: permitAmount,
        });

        const paymasterData = encodePacked(
          ["uint8", "address", "uint256", "bytes"],
          [0, usdcAddress, permitAmount, permitSignature]
        );

        return {
          paymaster: paymasterAddress,
          paymasterData,
          paymasterVerificationGasLimit: hexToBigInt("0x200000"),
          paymasterPostOpGasLimit: hexToBigInt("0x15000"),
          isFinal: true,
        };
      },
    };

    // 4. Create the bundler client
    const bundlerClient = createBundlerClient({
      account,
      client,
      paymaster,
      userOperation: {
        estimateFeesPerGas: async ({
          bundlerClient,
        }) => {
          const fees = await bundlerClient.request({
            method: "pimlico_getUserOperationGasPrice" as any,
          });
          if (
            typeof fees === "object" &&
            fees !== null &&
            "standard" in fees &&
            typeof (fees as any).standard === "object"
          ) {
            const maxFeePerGas = hexToBigInt(
              (fees as any).standard.maxFeePerGas
            );
            const maxPriorityFeePerGas = hexToBigInt(
              (fees as any).standard.maxPriorityFeePerGas
            );

            return { maxFeePerGas, maxPriorityFeePerGas };
          } else {
            throw new Error(
              "Unexpected response from pimlico_getUserOperationGasPrice: " +
                JSON.stringify(fees)
            );
          }
        },
      },
      transport: http(`https://public.pimlico.io/v2/${client.chain.id}/rpc`),
    });

    // 5. Prepare the markCompleted call
    const { user, id, newUri } = body;

    // 6. Sign authorization for the smart account
    const authorization = await owner.signAuthorization({
      chainId: chain.id,
      nonce: await client.getTransactionCount({ address: owner.address }),
      contractAddress: account.authorization.address,
    });

    // 7. Send the markCompleted transaction as a UserOperation
    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: contractAddress,
          abi: FraminoNFTAbi,
          functionName: "markCompleted",
          args: [user, id, newUri],
        },
      ],
      authorization: authorization,
    });

    const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });
    return { txHash: receipt.receipt.transactionHash };
  }

  public async redeemNftWithPaymasterService(
    body: NftRedeemRequest
  ): Promise<{ txHash: string }> {
    const chain = arbitrumSepolia;
    const paymasterAddress = process.env.PAYMASTER_V08_ADDRESS as `0x${string}`;
    const contractAddress = process.env
      .FRAMINO_NFT_CONTRACT_ADDRESS as `0x${string}`;
    const ownerPrivateKey = process.env
      .CONTRACT_OWNER_PRIVATE_KEY as `0x${string}`;
    const usdcAddress = process.env.USDC_ADDRESS as `0x${string}`;

    // 1. Create viem client and owner smart account
    const client = createPublicClient({ chain, transport: http() });
    const owner = privateKeyToAccount(ownerPrivateKey);
    const account = await toSimple7702SmartAccount({ client, owner });

    // 2. Set up the paymaster
    const paymaster = {
      async getPaymasterData() {
        const permitAmount = hexToBigInt("0x100000000");
        const permitSignature = await signPermit({
          tokenAddress: usdcAddress,
          account,
          client,
          spenderAddress: paymasterAddress,
          permitAmount: permitAmount,
        });

        const paymasterData = encodePacked(
          ["uint8", "address", "uint256", "bytes"],
          [0, usdcAddress, permitAmount, permitSignature]
        );

        return {
          paymaster: paymasterAddress,
          paymasterData,
          paymasterVerificationGasLimit: hexToBigInt("0x200000"),
          paymasterPostOpGasLimit: hexToBigInt("0x15000"),
          isFinal: true,
        };
      },
    };

    // 3. Create bundler client
    const bundlerClient = createBundlerClient({
      account,
      client,
      paymaster,
      userOperation: {
        estimateFeesPerGas: async ({ bundlerClient }) => {
          const fees = await bundlerClient.request({
            method: "pimlico_getUserOperationGasPrice" as any,
          });
          if (
            typeof fees === "object" &&
            fees !== null &&
            "standard" in fees &&
            typeof (fees as any).standard === "object"
          ) {
            const maxFeePerGas = hexToBigInt(
              (fees as any).standard.maxFeePerGas
            );
            const maxPriorityFeePerGas = hexToBigInt(
              (fees as any).standard.maxPriorityFeePerGas
            );
            return { maxFeePerGas, maxPriorityFeePerGas };
          } else {
            throw new Error(
              "Unexpected response from pimlico_getUserOperationGasPrice: " +
                JSON.stringify(fees)
            );
          }
        },
      },
      transport: http(`https://public.pimlico.io/v2/${client.chain.id}/rpc`),
    });

    // 4. Prepare redeem call
    const { user, id, amount } = body;
    // If your contract's redeem function requires the user address, add it to args
    const args = [user, id, amount];

    // 5. Sign authorization for the smart account
    const authorization = await owner.signAuthorization({
      chainId: chain.id,
      nonce: await client.getTransactionCount({ address: owner.address }),
      contractAddress: account.authorization.address,
    });

    // 6. Send the redeem transaction as a UserOperation
    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: contractAddress,
          abi: FraminoNFTAbi,
          functionName: "redeem",
          args: args,
        },
      ],
      authorization: authorization,
    });

    const receipt = await bundlerClient.waitForUserOperationReceipt({ hash });
    return { txHash: receipt.receipt.transactionHash };
  }

  public async getContractInfoService() {
    const contractAddress = process.env.FRAMINO_NFT_CONTRACT_ADDRESS!;

    return {
      address: contractAddress,
      abi: FraminoNFTAbi,
    };
  }
}
