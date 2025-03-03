# Fixing the Row Level Security (RLS) Policy Issue

## The Problem

When trying to register a new account, you encountered the following error:

```
"new row violates row-level security policy for table "profiles"
```

This error occurs because the Supabase database has Row Level Security enabled for the `profiles` table, but we're missing a policy that allows users to insert their own profile during registration.

## The Solution

You need to add an INSERT policy to the `profiles` table in your Supabase project.

### Steps to Fix:

1. **Log in to your Supabase Dashboard**:

   - Go to [app.supabase.com](https://app.supabase.com/) and sign in
   - Select your project

2. **Open the SQL Editor**:

   - Click on "SQL Editor" in the left sidebar
   - Create a new query

3. **Run the following SQL command**:

   ```sql
   -- Add missing INSERT policy for profiles table
   CREATE POLICY "Users can insert their own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);
   ```

4. **Click "Run" to execute the query**

5. **Verify the policy was created**:

   - Go to "Database" in the left sidebar
   - Click on "Tables" and find the "profiles" table
   - Click on "Policies" tab
   - You should see the new "Users can insert their own profile" policy listed

6. **Test registration again**:
   - Try registering a new account
   - The error should be resolved

## Why This Happened

Row Level Security (RLS) in Supabase restricts which rows a user can access in a database table. When we enabled RLS on the `profiles` table, we added policies for SELECT and UPDATE operations, but forgot to add a policy for INSERT operations. This meant that even though the authentication worked, the user couldn't create their profile in the database.

The new policy we added specifically allows users to insert a row in the `profiles` table only if the `id` column matches their authenticated user ID (`auth.uid()`).
