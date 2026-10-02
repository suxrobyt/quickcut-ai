-- Users table (Supabase auth will handle this, but we can add custom fields)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'UPLOADING', 'ANALYZING', 'EDITING', 'RENDERING', 'COMPLETED', 'FAILED')),
  aspect_ratio TEXT DEFAULT '9:16' CHECK (aspect_ratio IN ('16:9', '9:16', '1:1', '4:3')),
  editing_mode TEXT DEFAULT 'AUTO' CHECK (editing_mode IN ('AUTO', 'SMART', 'MANUAL', 'MEME', 'SHORTS', 'CINEMATIC', 'MUSIC_SYNC')),
  media_duration FLOAT DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Media assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'image', 'audio')),
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  duration FLOAT,
  resolution_width INTEGER,
  resolution_height INTEGER,
  thumbnail_url TEXT,
  storage_url TEXT NOT NULL,
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'analyzing', 'ready', 'failed')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Editing plans table
CREATE TABLE IF NOT EXISTS editing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Render jobs table
CREATE TABLE IF NOT EXISTS render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  quality TEXT DEFAULT 'standard' CHECK (quality IN ('fast', 'standard', 'high')),
  resolution TEXT DEFAULT '1080p' CHECK (resolution IN ('720p', '1080p', '4k')),
  fps INTEGER DEFAULT 30,
  progress INTEGER DEFAULT 0,
  output_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- AI chat history table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS media_assets_project_id_idx ON media_assets(project_id);
CREATE INDEX IF NOT EXISTS editing_plans_project_id_idx ON editing_plans(project_id);
CREATE INDEX IF NOT EXISTS render_jobs_project_id_idx ON render_jobs(project_id);
CREATE INDEX IF NOT EXISTS ai_chat_history_project_id_idx ON ai_chat_history(project_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE editing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can only read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for projects
CREATE POLICY "Users can only access their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for media_assets
CREATE POLICY "Users can access media in their projects"
  ON media_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = media_assets.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create media in their projects"
  ON media_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = media_assets.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their media"
  ON media_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = media_assets.project_id AND projects.user_id = auth.uid()
    )
  );

-- Similar policies for editing_plans, render_jobs, and ai_chat_history
CREATE POLICY "Users can access editing plans of their projects"
  ON editing_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = editing_plans.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create editing plans"
  ON editing_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = editing_plans.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access render jobs of their projects"
  ON render_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = render_jobs.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create render jobs"
  ON render_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = render_jobs.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access chat history of their projects"
  ON ai_chat_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = ai_chat_history.project_id AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat messages"
  ON ai_chat_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = ai_chat_history.project_id AND projects.user_id = auth.uid()
    )
  );
