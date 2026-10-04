-- Allow wedding video uploads in the media bucket (content v2 video section).
-- Code already validates MP4/WebM by magic bytes and caps at 50 MiB; the bucket
-- previously rejected video MIME types at 8 MiB, so uploads failed with 502.

update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'audio/mpeg', 'video/mp4', 'video/webm']
where id = 'media';
