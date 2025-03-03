-- Create the property_projects table
CREATE TABLE IF NOT EXISTS property_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  bedrooms TEXT,
  bathrooms TEXT,
  square_feet TEXT,
  listing_price TEXT,
  features TEXT,
  selling_points TEXT,
  target_buyer TEXT,
  neighborhood_highlights TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security
ALTER TABLE property_projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own projects
CREATE POLICY "Users can view their own projects" 
  ON property_projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own projects
CREATE POLICY "Users can insert their own projects" 
  ON property_projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own projects
CREATE POLICY "Users can update their own projects" 
  ON property_projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own projects
CREATE POLICY "Users can delete their own projects" 
  ON property_projects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS property_projects_user_id_idx ON property_projects (user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_property_projects_updated_at
BEFORE UPDATE ON property_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 