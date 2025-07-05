import { NextRequest, NextResponse } from 'next/server';
import { FraminoService } from '../../../../lib/services/framinoService';
import { NftMarkCompletedRequest } from '../../../../lib/models/framinoModel';
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
    
    if (body.id === undefined || body.id === null) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    if (!body.newUri) {
      return NextResponse.json(
        { error: 'Missing required field: newUri' },
        { status: 400 }
      );
    }

    const requestBody: NftMarkCompletedRequest = body;

    // Validate user address format (basic check)
    if (!requestBody.user.startsWith('0x') || requestBody.user.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid user address format' },
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

    // Validate newUri format (basic check)
    if (!requestBody.newUri || requestBody.newUri.trim().length === 0) {
      return NextResponse.json(
        { error: 'newUri cannot be empty' },
        { status: 400 }
      );
    }

    // Initialize service and process mark completed
    const framinoService = new FraminoService();
    const result = await framinoService.markCompletedWithPaymasterService(requestBody);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'NFT marked as completed successfully'
    });

  } catch (error) {
    console.error('Error in mark-completed-with-paymaster:', error);
    
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
