import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://api.ersa-training.com/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  console.log(`[API Proxy GET] ${endpoint}`);
  
  try {
    const apiUrl = `${API_BASE_URL}/${endpoint}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const apiUrl = `${API_BASE_URL}/${endpoint}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const apiUrl = `${API_BASE_URL}/${endpoint}`;
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const apiUrl = `${API_BASE_URL}/${endpoint}`;
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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
