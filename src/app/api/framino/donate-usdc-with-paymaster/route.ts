import { NextRequest, NextResponse } from 'next/server';
import { FraminoService } from '../../../../lib/services/framinoService';
import { DonateRequest } from '../../../../lib/models/framinoModel';
import { validateEnvironmentVariables } from '../../../../lib/utils/apiHelpers';

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    validateEnvironmentVariables([
      'PROVIDER_URL',
      'CONTRACT_OWNER_PRIVATE_KEY',
      'FRAMINO_NFT_CONTRACT_ADDRESS',
      'USDC_ADDRESS',
      'PAYMASTER_V08_ADDRESS',
      'SENDER_PRIVATE_KEY',
      'RECIPIENT_ADDRESS'
    ]);

    // Parse request body
    const body = await req.json();

    // Validate request body
    if (!body.amount) {
      return NextResponse.json(
        { error: 'Missing required field: amount' },
        { status: 400 }
      );
    }

    const requestBody: DonateRequest = body;

    // Validate amount format
    const amount = parseFloat(requestBody.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      );
    }

    // Initialize service and process donation
    const framinoService = new FraminoService();
    const result = await framinoService.donateUSDCWithPaymasterService(requestBody);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'USDC donation completed successfully'
    });

  } catch (error) {
    console.error('Error in donate-usdc-with-paymaster:', error);
    
    if (error instanceof Error) {
      // Handle known blockchain/validation errors
      if (error.message.includes('Insufficient USDC balance')) {
        return NextResponse.json(
          { error: error.message },
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
        { error: 'Unknown error occurred' },
        { status: 500 }
      );
    }
  }
}
