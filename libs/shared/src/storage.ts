import { supabase } from './supabase';

/**
 * Upload an image file to Supabase Storage and return the public URL.
 */
export async function uploadImage(file: File): Promise<string | null> {
  const ext = file.name?.split('.').pop() || file.type.split('/')[1] || 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '31536000',
    });

  if (error) {
    console.error('Image upload failed:', error.message);
    return null;
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
