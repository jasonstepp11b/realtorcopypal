-- Add project_id column to generations table
ALTER TABLE generations ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES property_projects(id) ON DELETE CASCADE;

-- Create project_content table
CREATE TABLE IF NOT EXISTS project_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES property_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('property-listing', 'social-media', 'email-campaign')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS project_content_project_id_idx ON project_content(project_id);
CREATE INDEX IF NOT EXISTS project_content_user_id_idx ON project_content(user_id);
CREATE INDEX IF NOT EXISTS project_content_content_type_idx ON project_content(content_type);
CREATE INDEX IF NOT EXISTS generations_project_id_idx ON generations(project_id);

-- Add RLS policies for project_content table
ALTER TABLE project_content ENABLE ROW LEVEL SECURITY;

-- Policy for selecting project content (users can only see their own content)
CREATE POLICY select_project_content ON project_content
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting project content (users can only insert their own content)
CREATE POLICY insert_project_content ON project_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating project content (users can only update their own content)
CREATE POLICY update_project_content ON project_content
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting project content (users can only delete their own content)
CREATE POLICY delete_project_content ON project_content
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_project_content_updated_at
BEFORE UPDATE ON project_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 