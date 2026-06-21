-- Migration: Setup Confession Wall Database Schema
-- Jalankan SQL ini di Supabase SQL Editor

-- 1. Create enums
CREATE TYPE confession_status AS ENUM ('pending', 'published', 'private', 'rejected');
CREATE TYPE confession_font AS ENUM ('sans', 'serif', 'mono', 'handwriting');

-- 2. Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: profiles can be read by anyone (for display)
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Policy: users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy: users can update own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 3. Create confessions table
CREATE TABLE confessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  font confession_font DEFAULT 'sans',
  is_public BOOLEAN DEFAULT true,
  allow_replies BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT true,
  status confession_status DEFAULT 'pending',
  likes INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read published confessions
CREATE POLICY "Published confessions are viewable by everyone" 
  ON confessions FOR SELECT 
  USING (status = 'published');

-- Policy: authenticated users can read their own confessions (pending/private)
CREATE POLICY "Users can view own confessions" 
  ON confessions FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: anyone can insert confessions (anonymous)
CREATE POLICY "Anyone can insert confessions" 
  ON confessions FOR INSERT 
  WITH CHECK (true);

-- Policy: users can update own confessions
CREATE POLICY "Users can update own confessions" 
  ON confessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: HR can see all confessions (via service_role)
-- Note: HR dashboard will use service_role key or custom claim

-- 4. Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read comments on published confessions
CREATE POLICY "Comments are viewable by everyone" 
  ON comments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM confessions 
    WHERE confessions.id = comments.confession_id 
    AND confessions.status = 'published'
  ));

-- Policy: anyone can insert comments if confession allows replies
CREATE POLICY "Anyone can insert comments" 
  ON comments FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM confessions 
    WHERE confessions.id = comments.confession_id 
    AND confessions.allow_replies = true
  ));

-- 5. Create likes table (prevent double-like)
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(confession_id, user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can see like counts
CREATE POLICY "Likes are viewable by everyone" 
  ON likes FOR SELECT 
  USING (true);

-- Policy: authenticated users can insert likes
CREATE POLICY "Authenticated users can insert likes" 
  ON likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can delete own likes
CREATE POLICY "Users can delete own likes" 
  ON likes FOR DELETE 
  USING (auth.uid() = user_id);

-- 6. Create hr_replies table (private HR replies to confessions)
CREATE TABLE hr_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hr_replies ENABLE ROW LEVEL SECURITY;

-- Policy: HR replies visible only to confession owner and admin
CREATE POLICY "HR replies visible to owner and admin"
  ON hr_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM confessions
      WHERE confessions.id = hr_replies.confession_id
      AND (confessions.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
    )
  );

-- Policy: only admin can insert HR replies
CREATE POLICY "Only admin can insert HR replies"
  ON hr_replies FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

-- 7. Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'hr_reply',
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: users can see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Create indexes for performance
CREATE INDEX idx_confessions_status ON confessions(status);
CREATE INDEX idx_confessions_created_at ON confessions(created_at DESC);
CREATE INDEX idx_confessions_user_id ON confessions(user_id);
CREATE INDEX idx_comments_confession_id ON comments(confession_id);
CREATE INDEX idx_likes_confession_id ON likes(confession_id);
CREATE INDEX idx_hr_replies_confession_id ON hr_replies(confession_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);