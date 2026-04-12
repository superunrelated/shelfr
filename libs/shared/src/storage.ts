import { supabase } from './supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Upload an image file to Supabase Storage and return the public URL.
 */
export async function uploadImage(file: File): Promise<string | null> {
  if (file.size > MAX_FILE_SIZE) {
    console.error('Image upload rejected: file exceeds 10 MB');
    return null;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    console.error(`Image upload rejected: unsupported type ${file.type}`);
    return null;
  }

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
