import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { questionId, response, password } = await request.json();
    
    // Check admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update question with admin response
    const { error: updateError } = await supabase
      .from('questions')
      .update({
        admin_response: response,
        status: 'answered',
        answered_at: new Date().toISOString()
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Response saved successfully'
    });
  } catch (error) {
    console.error('Admin response error:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}