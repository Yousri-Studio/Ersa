import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:5002/api';

// Ensure API_BASE_URL ends with /api for local development
const getBackendUrl = () => {
  if (API_BASE_URL.includes('localhost') && !API_BASE_URL.endsWith('/api')) {
    return `${API_BASE_URL}/api`;
  }
  return API_BASE_URL;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  console.log(`[API Proxy GET] ${endpoint}`);
  console.log(`[API Proxy] BACKEND_API_URL: ${getBackendUrl()}`);
  
  try {
    // Remove leading slash from endpoint if present to avoid double slashes
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // If the endpoint starts with 'api/', remove it since backend URL already includes /api
    if (cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.slice(4); // Remove 'api/'
    }
    
    // Build URL with query parameters
    const backendUrl = getBackendUrl();
    const apiUrl = new URL(`${backendUrl}/${cleanEndpoint}`);
    
    // Forward all query parameters except 'endpoint'
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        apiUrl.searchParams.append(key, value);
      }
    });
    
    console.log(`[API Proxy] Forwarding to: ${apiUrl.toString()}`);
    
    // Forward authorization header if present
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`[API Proxy] Forwarding Authorization header`);
    }
    
    const response = await fetch(apiUrl.toString(), {
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
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // If the endpoint starts with 'api/', remove it since backend URL already includes /api
    if (cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.slice(4); // Remove 'api/'
    }
    
    const backendUrl = getBackendUrl();
    const apiUrl = `${backendUrl}/${cleanEndpoint}`;
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
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // If the endpoint starts with 'api/', remove it since backend URL already includes /api
    if (cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.slice(4); // Remove 'api/'
    }
    
    const backendUrl = getBackendUrl();
    const apiUrl = `${backendUrl}/${cleanEndpoint}`;
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
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // If the endpoint starts with 'api/', remove it since backend URL already includes /api
    if (cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.slice(4); // Remove 'api/'
    }
    
    const backendUrl = getBackendUrl();
    const apiUrl = `${backendUrl}/${cleanEndpoint}`;
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
