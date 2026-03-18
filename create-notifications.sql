-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.video_comments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_type CHECK (type IN ('new_comment', 'comment_reply', 'new_subscriber'))
);

-- Enable RLS for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

-- Users cannot directly insert notifications (system-managed)
-- Notifications are created by triggers

-- Create index on recipient_id for faster queries
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Trigger: Create notification when someone comments on your video
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, actor_id, video_id, comment_id, type, title, message)
  SELECT 
    videos.user_id,
    NEW.user_id,
    NEW.video_id,
    NEW.id,
    'new_comment',
    COALESCE(profiles.full_name, 'Someone') || ' commented on your video',
    LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END
  FROM public.videos
  LEFT JOIN public.profiles ON profiles.id = NEW.user_id
  WHERE videos.id = NEW.video_id AND videos.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new comments
DROP TRIGGER IF EXISTS on_comment_created ON public.video_comments;
CREATE TRIGGER on_comment_created
AFTER INSERT ON public.video_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_comment();
