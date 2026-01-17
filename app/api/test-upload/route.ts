import { NextRequest, NextResponse } from 'next/server';

// Create admin client directly in this file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const supabaseAdmin = require('@supabase/supabase-js').createClient(
  supabaseUrl, 
  supabaseServiceKey
);

export async function POST(request: NextRequest) {
  console.log('📤 Test upload API called (POST)');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📤 File received:', file?.name, file?.size);
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Simple filename
    const fileName = `test-${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    
    console.log('📤 Uploading to Supabase Storage...');

    // Upload using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('question-files')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Storage upload failed',
        details: error.message,
        code: error.statusCode
      }, { status: 500 });
    }

    console.log('✅ Upload successful, getting URL...');

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('question-files')
      .getPublicUrl(fileName);

    console.log('✅ Public URL:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileName,
      url: urlData.publicUrl,
      data
    });

  } catch (error) {
    console.error('❌ Test upload error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}