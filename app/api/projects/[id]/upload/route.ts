import { supabaseAdmin } from '@/lib/supabase/client';
import { SupabaseStorageProvider } from '@/lib/providers/storage-provider';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Upload file
    const storage = new SupabaseStorageProvider();
    const path = `projects/${params.id}/${Date.now()}-${file.name}`;

    const { url, path: storagePath } = await storage.uploadFile(file, path);

    // Get file type
    let mediaType: 'video' | 'image' | 'audio' = 'image';
    if (file.type.startsWith('video')) {
      mediaType = 'video';
    } else if (file.type.startsWith('audio')) {
      mediaType = 'audio';
    }

    // Create media asset record
    const { data, error } = await supabaseAdmin
      .from('media_assets')
      .insert([
        {
          project_id: params.id,
          file_name: file.name,
          type: mediaType,
          mime_type: file.type,
          file_size: file.size,
          thumbnail_url: url,
          storage_url: url,
          status: 'ready',
          metadata: {
            uploaded_at: new Date().toISOString(),
          },
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('media_assets')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
