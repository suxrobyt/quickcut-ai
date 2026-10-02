import { supabaseAdmin } from '@/lib/supabase/client';
import { IStorageProvider } from './types';

export class SupabaseStorageProvider implements IStorageProvider {
  private bucketName: string;

  constructor(bucketName = 'quickcut-media') {
    this.bucketName = bucketName;
  }

  async uploadFile(
    file: File,
    path: string
  ): Promise<{ url: string; path: string }> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(this.bucketName).getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  }

  async deleteFile(path: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { error } = await supabaseAdmin.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async downloadFile(path: string): Promise<Blob> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { data, error } = await supabaseAdmin.storage
      .from(this.bucketName)
      .download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  async generateThumbnail(videoUrl: string): Promise<string> {
    // For now, return a placeholder
    // In production, integrate with FFmpeg or external service
    return videoUrl.replace(/\.[^.]+$/, '_thumb.jpg');
  }
}
