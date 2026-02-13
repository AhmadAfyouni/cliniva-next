import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join('/');
    
    // Construct the backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const fileUrl = `${backendUrl.replace('/api/v1', '')}/uploads/${filePath}`;
    
    // Fetch the file from the backend
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Get the file content and headers
    const fileBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
