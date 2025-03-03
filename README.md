# RealtorCopyPal

AI-powered marketing copy generator for real estate agents. Generate high-quality marketing copy for your real estate listings, social media posts, and email campaigns with minimal input.

## Features

- User authentication (email/password)
- Save and organize generated content
- View saved generations by type
- Modern, responsive UI

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- Vercel AI SDK

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Supabase Setup

1. **Create a Supabase Project**:

   - Go to [supabase.com](https://supabase.com/) and sign up for an account
   - Create a new project and note your project URL and API keys

2. **Database Setup**:
   - In the Supabase dashboard, go to the SQL Editor
   - Run the following SQL to create the necessary tables:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policy for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create generations table
CREATE TABLE generations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policy for generations
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own generations" ON generations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own generations" ON generations
  FOR DELETE USING (auth.uid() = user_id);
```

3. **Authentication Setup**:
   - In the Supabase dashboard, go to Authentication > Providers
   - Enable Email/Password authentication

### Project Setup

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/realtorcopypal.git
cd realtorcopypal
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and anon key from your Supabase project settings
   - Add any other API keys as needed

```bash
cp .env.local.example .env.local
```

4. **Run the development server**:

```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Testing Supabase Integration

1. Navigate to `/test-supabase` in your browser
2. Sign in with your credentials
3. The page will run tests to verify your Supabase setup is working correctly

## Deployment

This project can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
