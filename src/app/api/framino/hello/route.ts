import { NextResponse } from 'next/server';

export async function GET() {
  // Return plain text response
  return new NextResponse('Hello from Framino API!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// Optional: Also support POST for testing
export async function POST() {
  return new NextResponse('Hello from Framino API via POST! 🥾', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
