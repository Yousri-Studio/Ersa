import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://api.ersa-training.com/api';

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
    // Check if this is a multipart/form-data request (file upload)
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    console.log(`[API Proxy] Content-Type: ${contentType}`);
    console.log(`[API Proxy] Is multipart: ${isMultipart}`);
    
    // For multipart, use formData; for JSON, use text
    const body = isMultipart ? await request.formData() : await request.text();
    
    // Remove leading slash from endpoint if present to avoid double slashes
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // If the endpoint starts with 'api/', remove it since backend URL already includes /api
    if (cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.slice(4); // Remove 'api/'
    }
    
    const backendUrl = getBackendUrl();
    const apiUrl = `${backendUrl}/${cleanEndpoint}`;
    console.log(`[API Proxy] Forwarding POST to: ${apiUrl}`);
    console.log(`[API Proxy] Request body type:`, isMultipart ? 'FormData' : 'text');
    
    // Build headers - for multipart, don't set Content-Type (let fetch handle it)
    const headers: HeadersInit = {};
    
    // Only set Content-Type for non-multipart requests
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`[API Proxy] Forwarding Authorization header`);
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body, // Send formData for multipart, text for JSON
      cache: 'no-store',
    });
    
    console.log(`[API Proxy] Backend response status: ${response.status}`);
    
    if (!response.ok) {
      // Try to get error details from response body
      let errorDetails = response.statusText;
      try {
        const errorBody = await response.text();
        console.error(`[API Proxy] Error response body:`, errorBody);
        errorDetails = errorBody || response.statusText;
      } catch (e) {
        console.error(`[API Proxy] Could not read error response body`);
      }
      
      console.error(`[API Proxy] Error: ${response.status} ${errorDetails}`);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}`, details: errorDetails },
        { status: response.status }
      );
    }
    
    // Try to parse response as JSON, but handle empty responses
    const responseText = await response.text();
    if (responseText) {
      try {
        const data = JSON.parse(responseText);
        console.log(`[API Proxy] Success! JSON response received`);
        return NextResponse.json(data);
      } catch (e) {
        console.log(`[API Proxy] Success! Non-JSON response received`);
        return new NextResponse(responseText, { status: response.status });
      }
    } else {
      // Empty response body (e.g., 200 OK with no content)
      console.log(`[API Proxy] Success! Empty response (status ${response.status})`);
      return new NextResponse(null, { status: response.status });
    }
  } catch (error) {
    console.error('[API Proxy] Exception:', error);
    console.error('[API Proxy] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'API request failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  console.log(`[API Proxy PUT] ${endpoint}`);
  
  try {
    // Try to parse body, but handle empty body gracefully
    let body = null;
    const bodyText = await request.text();
    if (bodyText && bodyText.trim().length > 0) {
      try {
        body = JSON.parse(bodyText);
      } catch (e) {
        console.warn(`[API Proxy] Failed to parse body as JSON, using empty body`);
      }
    }
    
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
    
    const fetchOptions: RequestInit = {
      method: 'PUT',
      headers,
      cache: 'no-store',
    };
    
    // Only add body if it exists
    if (body !== null) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(apiUrl, fetchOptions);
    
    if (!response.ok) {
      console.error(`[API Proxy] Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Handle empty response
    const responseText = await response.text();
    if (responseText && responseText.trim().length > 0) {
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data);
      } catch (e) {
        return new NextResponse(responseText, { status: response.status });
      }
    } else {
      return new NextResponse(null, { status: response.status });
    }
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
