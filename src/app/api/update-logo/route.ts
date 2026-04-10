import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch logo from URL' }, { status: 400 });

    const buffer = Buffer.from(await res.arrayBuffer());
    const logoPath = path.join(process.cwd(), 'public', 'store-logo.png');
    fs.writeFileSync(logoPath, buffer);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('update-logo error:', err);
    return NextResponse.json({ error: 'Failed to update logo' }, { status: 500 });
  }
}
