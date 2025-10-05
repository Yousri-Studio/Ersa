import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://api.ersa-training.com/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  console.log(`[API Proxy GET] ${endpoint}`);
  console.log(`[API Proxy] BACKEND_API_URL: ${API_BASE_URL}`);
  
  try {
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const apiUrl = `${API_BASE_URL}/${cleanEndpoint}`;
    console.log(`[API Proxy] Forwarding to: ${apiUrl}`);
    
    // Forward authorization header if present
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`[API Proxy] Forwarding Authorization header`);
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`[API Proxy] Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'API request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  console.log(`[API Proxy POST] ${endpoint}`);
  
  try {
    const body = await request.json();
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const apiUrl = `${API_BASE_URL}/${cleanEndpoint}`;
    console.log(`[API Proxy] Forwarding to: ${apiUrl}`);
    
    // Forward authorization header if present
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`[API Proxy] Forwarding Authorization header`);
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`[API Proxy] Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'API request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  console.log(`[API Proxy PUT] ${endpoint}`);
  
  try {
    const body = await request.json();
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const apiUrl = `${API_BASE_URL}/${cleanEndpoint}`;
    console.log(`[API Proxy] Forwarding to: ${apiUrl}`);
    
    // Forward authorization header if present
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`[API Proxy] Forwarding Authorization header`);
    }
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`[API Proxy] Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'API request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  console.log(`[API Proxy DELETE] ${endpoint}`);
  
  try {
    // Remove leading slash from endpoint if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const apiUrl = `${API_BASE_URL}/${cleanEndpoint}`;
    console.log(`[API Proxy] Forwarding to: ${apiUrl}`);
    
    // Forward authorization header if present
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`[API Proxy] Forwarding Authorization header`);
    }
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`[API Proxy] Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'API request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
