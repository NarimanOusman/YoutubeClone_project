-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload their own videos
CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND 
  auth.role() = 'authenticated' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own videos
CREATE POLICY "Users can read their own videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'videos' AND 
  auth.role() = 'authenticated' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos' AND 
  auth.role() = 'authenticated' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' AND 
  auth.role() = 'authenticated' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Policies for videos table
CREATE POLICY "Users can view their own videos" ON videos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" ON videos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" ON videos
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" ON videos
FOR DELETE USING (auth.uid() = user_id);

-- Public can view all videos (for the main feed)
CREATE POLICY "Public can view videos" ON videos
FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
