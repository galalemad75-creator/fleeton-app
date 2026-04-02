-- Fix RLS policies for user registration
-- Run this in Supabase SQL Editor AFTER the main schema

-- Allow users to insert their own profile during signup
CREATE POLICY "Users insert self" ON users FOR INSERT WITH CHECK (id = auth.uid());

-- Allow authenticated users to create companies
CREATE POLICY "Authenticated can create companies" ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own company (for owner to manage settings)
CREATE POLICY "Company owner update" ON companies FOR UPDATE USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));
