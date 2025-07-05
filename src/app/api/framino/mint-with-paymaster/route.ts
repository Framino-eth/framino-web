import { NextRequest, NextResponse } from 'next/server';
import { FraminoService } from '../../../../lib/services/framinoService';
import { NftMintRequest } from '../../../../lib/models/framinoModel';
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
    if (!body.account) {
      return NextResponse.json(
        { error: 'Missing required field: account' },
        { status: 400 }
      );
    }
    
    if (body.id === undefined || body.id === null) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    if (body.value === undefined || body.value === null) {
      return NextResponse.json(
        { error: 'Missing required field: value' },
        { status: 400 }
      );
    }
    
    if (!body.uri) {
      return NextResponse.json(
        { error: 'Missing required field: uri' },
        { status: 400 }
      );
    }

    const requestBody: NftMintRequest = body;

    // Validate account address format (basic check)
    if (!requestBody.account.startsWith('0x') || requestBody.account.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid account address format' },
        { status: 400 }
      );
    }

    // Validate id range (0-7 based on your model comment)
    if (!Number.isInteger(requestBody.id) || requestBody.id < 0 || requestBody.id > 7) {
      return NextResponse.json(
        { error: 'Invalid id. Must be an integer between 0-7' },
        { status: 400 }
      );
    }

    // Validate value is positive
    if (!Number.isInteger(requestBody.value) || requestBody.value <= 0) {
      return NextResponse.json(
        { error: 'Invalid value. Must be a positive integer' },
        { status: 400 }
      );
    }

    // Validate URI format (basic check)
    if (!requestBody.uri || requestBody.uri.trim().length === 0) {
      return NextResponse.json(
        { error: 'URI cannot be empty' },
        { status: 400 }
      );
    }

    // Initialize service and process mint
    const framinoService = new FraminoService();
    const result = await framinoService.mintNftWithPaymasterService(requestBody);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'NFT minted successfully'
    });

  } catch (error) {
    console.error('Error in mint-with-paymaster:', error);
    
    if (error instanceof Error) {
      // Handle known blockchain/validation errors
      if (error.message.includes('execution reverted')) {
        return NextResponse.json(
          { error: 'Transaction failed on blockchain', details: error.message },
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
