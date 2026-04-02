-- FleetOn — Complete Fixed Supabase Schema
-- Run this in Supabase SQL Editor to set up everything correctly

-- ==================== TABLES ====================

CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','business','enterprise')),
  driver_code TEXT UNIQUE NOT NULL,
  dispatcher_code TEXT UNIQUE NOT NULL,
  cars_limit INT DEFAULT 1,
  drivers_limit INT DEFAULT 1,
  dispatchers_limit INT DEFAULT 1,
  api_enabled BOOLEAN DEFAULT false,
  api_key TEXT,
  trial_start TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('driver','dispatcher','maintenance','owner','accountant')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plate TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','busy')),
  current_driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  last_location TEXT,
  current_km DOUBLE PRECISION DEFAULT 0,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_km DOUBLE PRECISION DEFAULT 0,
  end_km DOUBLE PRECISION,
  start_location TEXT,
  end_location TEXT,
  start_lat DOUBLE PRECISION,
  start_lng DOUBLE PRECISION,
  end_lat DOUBLE PRECISION,
  end_lng DOUBLE PRECISION,
  odometer_photo TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed')),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  alert_km DOUBLE PRECISION,
  alert_date DATE,
  last_service_km DOUBLE PRECISION DEFAULT 0,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('voice','text')),
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== REALTIME ====================

ALTER TABLE cars REPLICA IDENTITY FULL;
ALTER TABLE trips REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE maintenance REPLICA IDENTITY FULL;

-- Only add if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'cars'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE cars, trips, messages, maintenance;
  END IF;
END $$;

-- ==================== RLS ====================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Users see own company" ON users;
DROP POLICY IF EXISTS "Users update self" ON users;
DROP POLICY IF EXISTS "Users insert self" ON users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;
DROP POLICY IF EXISTS "Cars company scoped" ON cars;
DROP POLICY IF EXISTS "Trips company scoped" ON trips;
DROP POLICY IF EXISTS "Maintenance company scoped" ON maintenance;
DROP POLICY IF EXISTS "Messages sender or receiver" ON messages;
DROP POLICY IF EXISTS "Companies readable by members" ON companies;
DROP POLICY IF EXISTS "Authenticated can create companies" ON companies;
DROP POLICY IF EXISTS "Company owner update" ON companies;
DROP POLICY IF EXISTS "Companies insert during signup" ON companies;
DROP POLICY IF EXISTS "Companies readable by code lookup" ON companies;

-- ==================== USERS POLICIES ====================

-- Allow reading users from same company
CREATE POLICY "Users see own company" ON users 
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    OR id = auth.uid()
  );

-- Allow users to update their own record
CREATE POLICY "Users update self" ON users 
  FOR UPDATE USING (id = auth.uid());

-- CRITICAL: Allow inserting user profile during signup
-- This uses a permissive check because during signup, the auth.uid() is the new user
CREATE POLICY "Users insert self" ON users 
  FOR INSERT WITH CHECK (id = auth.uid());

-- ==================== COMPANIES POLICIES ====================

-- Allow authenticated users to create companies (for owner registration)
CREATE POLICY "Authenticated can create companies" ON companies 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow reading companies by member lookup
CREATE POLICY "Companies readable by members" ON companies 
  FOR SELECT USING (
    id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Allow reading companies by code lookup (for group code validation during registration)
-- This is needed for non-authenticated users to validate group codes
CREATE POLICY "Companies readable by code lookup" ON companies 
  FOR SELECT USING (true);

-- Allow company owner to update company settings
CREATE POLICY "Company owner update" ON companies 
  FOR UPDATE USING (
    id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ==================== CARS POLICIES ====================

CREATE POLICY "Cars company scoped" ON cars 
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ==================== TRIPS POLICIES ====================

CREATE POLICY "Trips company scoped" ON trips 
  FOR ALL USING (
    car_id IN (SELECT id FROM cars WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
  );

-- Allow drivers to insert their own trips
CREATE POLICY "Drivers can create trips" ON trips 
  FOR INSERT WITH CHECK (driver_id = auth.uid());

-- ==================== MAINTENANCE POLICIES ====================

CREATE POLICY "Maintenance company scoped" ON maintenance 
  FOR ALL USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ==================== MESSAGES POLICIES ====================

CREATE POLICY "Messages sender or receiver" ON messages 
  FOR ALL USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Allow sending messages
CREATE POLICY "Users can send messages" ON messages 
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_cars_company ON cars(company_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_trips_car ON trips(car_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_car ON maintenance(car_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ==================== DONE ====================
-- Next steps:
-- 1. Create your Supabase project at https://supabase.com
-- 2. Copy the Project URL and Anon Key from Settings > API
-- 3. Create a .env file with:
--    EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
--    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
-- 4. Run: npx expo start
