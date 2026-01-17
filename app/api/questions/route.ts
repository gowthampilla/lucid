import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Create admin client for storage (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('📝 API: Starting question submission');
    const formData = await request.formData();
    
    // Extract form data
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const question = formData.get('question') as string;
    const current_role_field = formData.get('current_role_field') as string;
    const target_role = formData.get('target_role') as string;
    const skills = formData.get('skills') as string;
    const years_experience = formData.get('years_experience') as string;
    const file = formData.get('file') as File | null;

    console.log('📝 Form data received:', {
      name,
      email,
      questionLength: question?.length,
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size
    });

    // Convert years_experience
    const yearsExp = years_experience === 'null' || years_experience === '' 
      ? null 
      : parseInt(years_experience);

    // Save question to database first
    const { data: questionData, error: dbError } = await supabase
      .from('questions')
      .insert([{
        name,
        email,
        current_role_field,
        target_role,
        skills,
        years_experience: yearsExp,
        question,
        status: 'pending'
      }])
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    console.log('✅ Question saved to DB, ID:', questionData.id);

    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;

    // Upload file to Supabase Storage if exists
    if (file && file.size > 0) {
      console.log('📁 File upload starting:', {
        name: file.name,
        type: file.type,
        size: file.size,
        questionId: questionData.id
      });

      const fileExt = file.name.split('.').pop();
      const fileNameWithId = `${questionData.id}/${Date.now()}.${fileExt}`;
      
      console.log('📁 Storage path:', fileNameWithId);
      
      try {
        // Convert file to array buffer
        const fileBuffer = await file.arrayBuffer();
        console.log('📁 File buffer size:', fileBuffer.byteLength);
        
        // Upload to Supabase Storage using admin client
        console.log('📁 Uploading to Supabase Storage...');
        const { data: storageData, error: storageError } = await supabaseAdmin.storage
          .from('question-files')
          .upload(fileNameWithId, fileBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) {
          console.error('❌ Storage upload error:', storageError);
          console.log('⚠️ Continuing without file storage');
        } else {
          console.log('✅ Storage upload success:', storageData);
          
          // Get public URL for the file
          const { data: urlData } = supabaseAdmin.storage
            .from('question-files')
            .getPublicUrl(fileNameWithId);

          fileUrl = urlData.publicUrl;
          fileName = file.name;
          fileType = file.type;
          fileSize = file.size;

          console.log('🔗 Public URL generated:', fileUrl);

          // Update question with file info
          const { error: updateError } = await supabase
            .from('questions')
            .update({
              file_name: fileName,
              file_type: fileType,
              file_size: fileSize,
              file_url: fileUrl
            })
            .eq('id', questionData.id);

          if (updateError) {
            console.error('❌ File info update error:', updateError);
          } else {
            console.log('✅ File info updated in database');
          }
        }
      } catch (uploadError) {
        console.error('❌ File upload process error:', uploadError);
      }
    } else {
      console.log('📁 No file to upload');
    }

    return NextResponse.json({ 
      success: true, 
      id: questionData.id,
      message: 'Question submitted successfully',
      hasFile: !!file,
      fileUrl
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}