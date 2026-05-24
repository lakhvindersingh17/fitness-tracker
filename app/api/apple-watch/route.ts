import { NextResponse } from 'next/server';

// In-memory queue to simulate syncing backend data to the offline PWA
let syncQueue: any[] = [];

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Received Apple Watch data:", data);
    
    syncQueue.push({
      ...data,
      timestamp: Date.now()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Data queued for sync." 
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function GET() {
  const data = [...syncQueue];
  syncQueue = []; // Clear queue after fetching
  return NextResponse.json({ data });
}
