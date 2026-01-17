import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test if storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    console.log('📦 Available buckets:', buckets);
    
    if (bucketsError) {
      console.error('❌ Bucket list error:', bucketsError);
    }

    // Test if we can list files in question-files
    const { data: files, error: filesError } = await supabase.storage
      .from('question-files')
      .list();

    console.log('📁 Files in question-files:', files);
    
    return NextResponse.json({
      buckets: buckets || [],
      files: files || [],
      bucketError: bucketsError?.message,
      filesError: filesError?.message
    });
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}