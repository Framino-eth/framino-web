import { NextRequest, NextResponse } from 'next/server';
import { FraminoService } from '../../../../lib/services/framinoService';
import { NftRedeemRequest } from '../../../../lib/models/framinoModel';
import { validateEnvironmentVariables } from '../../../../lib/utils/apiHelpers';

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    validateEnvironmentVariables([
      'PROVIDER_URL',
      'CONTRACT_OWNER_PRIVATE_KEY',
      'FRAMINO_NFT_CONTRACT_ADDRESS',
      'USDC_ADDRESS',
      'PAYMASTER_V08_ADDRESS'
    ]);

    // Parse request body
    const body = await req.json();

    // Validate required fields
    if (!body.user) {
      return NextResponse.json(
        { error: 'Missing required field: user' },
        { status: 400 }
      );
    }

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    if (body.amount === undefined || body.amount === null) {
      return NextResponse.json(
        { error: 'Missing required field: amount' },
        { status: 400 }
      );
    }

    const requestBody: NftRedeemRequest = {
      user: body.user,
      id: body.id,
      amount: body.amount,
    };

    // Validate amount (should be positive number)
    const amountNum = parseFloat(requestBody.amount.toString());
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      );
    }

    // Initialize service and process redemption
    const framinoService = new FraminoService();
    const result = await framinoService.redeemNftWithPaymasterService(requestBody);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'NFT redemption completed successfully',
      redemptionDetails: {
        user: requestBody.user,
        id: requestBody.id,
        amount: requestBody.amount
      }
    });

  } catch (error) {
    console.error('Error in redeem-with-paymaster:', error);
    
    if (error instanceof Error) {
      // Handle known blockchain/validation errors
      if (error.message.includes('execution reverted')) {
        return NextResponse.json(
          { error: 'Redemption transaction failed on blockchain', details: error.message },
          { status: 400 }
        );
      } else if (error.message.includes('insufficient balance')) {
        return NextResponse.json(
          { error: 'Insufficient NFT balance for redemption', details: error.message },
          { status: 400 }
        );
      } else if (error.message.includes('Missing required environment variables')) {
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unknown error occurred during redemption' },
        { status: 500 }
      );
    }
  }
}
