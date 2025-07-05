import { NextResponse } from 'next/server';
import { FraminoService } from '../../../../lib/services/framinoService';
import { validateEnvironmentVariables } from '../../../../lib/utils/apiHelpers';

export async function GET() {
  try {
    // Validate environment variables
    validateEnvironmentVariables([
      'FRAMINO_NFT_CONTRACT_ADDRESS'
    ]);

    // Initialize service and get contract info
    const framinoService = new FraminoService();
    const result = await framinoService.getContractInfoService();

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Contract information retrieved successfully'
    });

  } catch (error) {
    console.error('Error in contract info:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Missing required environment variables')) {
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
