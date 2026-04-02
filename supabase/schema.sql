-- FleetOn — Supabase SQL Schema

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

-- Realtime
ALTER TABLE cars REPLICA IDENTITY FULL;
ALTER TABLE trips REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE maintenance REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE cars, trips, messages, maintenance;

-- RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own company" ON users FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users update self" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Cars company scoped" ON cars FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Trips company scoped" ON trips FOR ALL USING (car_id IN (SELECT id FROM cars WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())));
CREATE POLICY "Maintenance company scoped" ON maintenance FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Messages sender or receiver" ON messages FOR ALL USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Companies readable by members" ON companies FOR SELECT USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Indexes
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
