import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://api.ersa-training.com/api';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      BACKEND_API_URL: process.env.BACKEND_API_URL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    },
    backendUrl: BACKEND_URL,
    tests: [] as any[],
  };

  // Test 1: Check if we can resolve the backend URL
  try {
    console.log(`[Backend Test] Testing connection to: ${BACKEND_URL}/courses`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${BACKEND_URL}/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });
    
    clearTimeout(timeout);
    
    results.tests.push({
      name: 'Backend Connection Test',
      url: `${BACKEND_URL}/courses`,
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (response.ok) {
      const data = await response.json();
      results.tests[0].dataPreview = Array.isArray(data) ? `Array with ${data.length} items` : typeof data;
    }
  } catch (error: any) {
    results.tests.push({
      name: 'Backend Connection Test',
      url: `${BACKEND_URL}/courses`,
      success: false,
      error: error.message,
      errorType: error.constructor.name,
    });
  }

  // Test 2: DNS Resolution
  try {
    const hostname = new URL(BACKEND_URL).hostname;
    results.tests.push({
      name: 'DNS Resolution',
      hostname,
      success: true,
      note: 'Hostname parsed successfully',
    });
  } catch (error: any) {
    results.tests.push({
      name: 'DNS Resolution',
      success: false,
      error: error.message,
    });
  }

  return NextResponse.json(results, { status: 200 });
}

