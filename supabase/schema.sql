-- ============================================================================
-- AGRICONNECT & AGRIFLEET LOGISTICS SUPABASE SCHEMA
-- Run this entire script in Supabase Dashboard -> SQL Editor -> Click 'Run'
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES (Farmers, Buyers, Drivers, Admins)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text unique,
  role text not null default 'BUYER' check (role in ('BUYER', 'FARMER', 'DRIVER', 'ADMIN')),
  avatar_url text,
  default_address text,
  wallet_balance numeric default 12500,
  escrow_balance numeric default 0,
  is_verified boolean default false,
  status text default 'active' check (status in ('active', 'banned', 'pending')),
  created_at timestamptz default now()
);

-- Ensure profiles constraints exist even if table was created previously
do $$ 
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_email_unique'
  ) then
    alter table public.profiles add constraint profiles_email_unique unique (email);
  end if;
exception
  when others then null;
end $$;

-- ----------------------------------------------------------------------------
-- 2. PRODUCE LISTINGS
-- ----------------------------------------------------------------------------
create table if not exists public.produce (
  id bigint generated always as identity primary key,
  farmer_id uuid references public.profiles(id) on delete set null,
  farmer_name text not null,
  farmer_phone text not null,
  name text not null,
  category text not null check (category in ('Vegetables', 'Fruits', 'Grains', 'Herbs', 'Dairy', 'Organic')),
  price numeric not null,
  quantity text not null,
  unit text not null default 'kg',
  location text not null,
  description text,
  image_url text,
  middleman_price numeric not null,
  harvest_date text,
  is_organic boolean default true,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 3. VEHICLES & DRIVERS
-- ----------------------------------------------------------------------------
create table if not exists public.vehicles (
  id text primary key,
  driver_id text not null,
  type text not null check (type in ('Motorbike', 'Three-wheeler', 'Van', 'Small truck', 'Lorry')),
  model text not null,
  registration_number text not null,
  capacity_kg numeric not null,
  capacity_label text not null,
  documents_verified boolean default true,
  license_number text,
  photo_url text,
  created_at timestamptz default now()
);

create table if not exists public.drivers (
  id text primary key, -- e.g. 'drv-kasun' or UUID
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  email text not null,
  profile_image text,
  verification_status text not null default 'active' check (verification_status in ('pending', 'active', 'offline', 'suspended', 'rejected')),
  availability_status text not null default 'ONLINE' check (availability_status in ('ONLINE', 'OFFLINE', 'BUSY')),
  rating numeric default 4.9,
  total_trips int default 124,
  completed_trips int default 124,
  vehicle_id text references public.vehicles(id) on delete set null,
  operating_area text not null default 'Western Province',
  delivery_radius_km numeric default 35,
  preferred_hours text default '6:00 AM - 8:00 PM',
  wallet_balance numeric default 18450,
  today_earnings numeric default 5600,
  today_trips int default 3,
  current_lat double precision default 6.9271,
  current_lng double precision default 79.8612,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 4. ORDERS & TRANSACTIONS
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  produce_id bigint references public.produce(id) on delete set null,
  produce_name text not null,
  amount numeric not null,
  quantity_ordered text not null,
  buyer_id uuid references public.profiles(id) on delete set null,
  buyer_name text not null,
  farmer_name text not null,
  farmer_phone text not null,
  delivery_method text not null,
  delivery_address text not null,
  payment_method text not null,
  status text not null default 'Confirmed' check (status in ('Confirmed', 'Processing', 'Delivered', 'Cancelled', 'Disputed')),
  tracking_code text unique not null,
  handover_pin text not null,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 5. LOGISTICS DELIVERIES (PickMe Flash Style Engine)
-- ----------------------------------------------------------------------------
create table if not exists public.deliveries (
  id text primary key, -- e.g. 'DLV-10284'
  order_id bigint references public.orders(id) on delete cascade,
  tracking_code text not null,
  handover_pin text not null,
  farmer_id text,
  farmer_name text not null,
  farmer_phone text not null,
  farmer_avatar text,
  buyer_id text,
  buyer_name text not null,
  buyer_phone text not null,
  buyer_avatar text,
  pickup jsonb not null,
  dropoff jsonb not null,
  goods jsonb not null,
  vehicle_required text not null check (vehicle_required in ('Motorbike', 'Three-wheeler', 'Van', 'Small truck', 'Lorry')),
  distance_km numeric not null,
  estimated_minutes int not null,
  customer_delivery_fee numeric not null,
  driver_earnings numeric not null,
  platform_fee numeric not null,
  status text not null default 'Searching for Driver' check (status in (
    'Delivery Requested',
    'Searching for Driver',
    'Driver Assigned',
    'Driver En Route to Pickup',
    'Arrived at Pickup',
    'Goods Collected',
    'In Transit',
    'Arrived at Delivery',
    'Delivery Completed',
    'Cancelled',
    'Failed Delivery'
  )),
  assigned_driver_id text references public.drivers(id) on delete set null,
  requested_at timestamptz default now(),
  accepted_at timestamptz,
  pickup_at timestamptz,
  delivered_at timestamptz,
  pickup_proof jsonb,
  delivery_proof jsonb,
  problem_report jsonb,
  status_history jsonb not null default '[]'::jsonb
);

-- ----------------------------------------------------------------------------
-- 6. CHAT MESSAGES & NEGOTIATION
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id text not null,
  farmer_name text not null,
  buyer_name text not null,
  produce_name text not null,
  sender text not null check (sender in ('Buyer', 'Farmer')),
  content text not null,
  price_offer jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 7. ENABLE REALTIME ON KEY TABLES
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.deliveries;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.produce;
alter publication supabase_realtime add table public.drivers;
alter publication supabase_realtime add table public.messages;

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Defaulting to permissive read/write for seamless testing
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.produce enable row level security;
alter table public.vehicles enable row level security;
alter table public.drivers enable row level security;
alter table public.orders enable row level security;
alter table public.deliveries enable row level security;
alter table public.messages enable row level security;

-- Open policies for development and pairing:
create policy "Allow all operations for profiles" on public.profiles for all using (true) with check (true);
create policy "Allow all operations for produce" on public.produce for all using (true) with check (true);
create policy "Allow all operations for vehicles" on public.vehicles for all using (true) with check (true);
create policy "Allow all operations for drivers" on public.drivers for all using (true) with check (true);
create policy "Allow all operations for orders" on public.orders for all using (true) with check (true);
create policy "Allow all operations for deliveries" on public.deliveries for all using (true) with check (true);
create policy "Allow all operations for messages" on public.messages for all using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 9. INITIAL SEED DATA
-- ----------------------------------------------------------------------------

-- Seed Vehicle
insert into public.vehicles (id, driver_id, type, model, registration_number, capacity_kg, capacity_label, documents_verified, license_number)
values 
  ('veh-kasun', 'drv-kasun', 'Small truck', 'Isuzu Elf 2-Ton', 'WP CAB-1234', 1200, '1,200 kg', true, 'B-4829104'),
  ('veh-david', 'drv-david', 'Van', 'Toyota HiAce High-Roof', 'WP NB-5678', 850, '850 kg', true, 'B-9201844'),
  ('veh-nuwan', 'drv-nuwan', 'Three-wheeler', 'Bajaj Maxima Cargo', 'SP AB-9012', 450, '450 kg', true, 'A-7839102')
on conflict (id) do nothing;

-- Seed Drivers
insert into public.drivers (
  id, name, phone, email, profile_image, verification_status, availability_status, rating, total_trips, completed_trips, vehicle_id, operating_area, delivery_radius_km, preferred_hours, wallet_balance, today_earnings, today_trips
)
values 
  ('drv-kasun', 'Kasun Perera', '+94 77 345 6789', 'kasun.perera@agrifleet.lk', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'active', 'ONLINE', 4.9, 142, 140, 'veh-kasun', 'Western Province (Colombo, Negombo, Gampaha)', 40, '5:30 AM - 7:00 PM', 18450, 5600, 3),
  ('drv-david', 'David Silva', '+94 71 892 3456', 'david.silva@agrifleet.lk', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'active', 'ONLINE', 4.8, 98, 97, 'veh-david', 'Central Province (Kandy, Nuwara Eliya)', 35, '6:00 AM - 6:00 PM', 12800, 3200, 2),
  ('drv-nuwan', 'Nuwan Fernando', '+94 76 567 8901', 'nuwan.f@agrifleet.lk', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'active', 'OFFLINE', 4.95, 210, 208, 'veh-nuwan', 'Southern Province (Galle, Matara)', 30, '7:00 AM - 5:00 PM', 22100, 0, 0)
on conflict (id) do nothing;

-- Seed Produce
insert into public.produce (farmer_name, farmer_phone, name, category, price, quantity, unit, location, description, image_url, middleman_price, harvest_date, is_organic)
values
  ('Mateo Gutierrez', '+94 77 123 4567', 'Organic Roma Tomatoes', 'Vegetables', 2.80, '500 kg', 'kg', 'Negombo Agricultural Centre, Western Province', 'Vine-ripened organic Roma tomatoes, ideal for sauces and bulk grocery supply.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', 4.50, 'Harvested today', true),
  ('Sarah Jenkins', '+94 77 234 5678', 'Crisp Fuji Apples', 'Fruits', 3.20, '850 kg', 'kg', 'Kandy Highland Orchards, Central Province', 'Crisp, sweet Fuji apples directly picked from orchard trees in Kandy.', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80', 5.20, 'Harvested yesterday', true),
  ('David Okafor', '+94 77 345 6789', 'Yukon Gold Potatoes', 'Vegetables', 1.40, '2000 kg', 'kg', 'Nuwara Eliya Potato Valley, Central Province', 'Firm, starchy potatoes freshly dug from rich high-altitude soil.', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80', 2.60, 'Harvested 2 days ago', false),
  ('Elena Rostova', '+94 77 456 7890', 'Fresh Sweet Corn', 'Grains', 1.90, '1200 ears', 'ears', 'Anuradhapura Agro Park, North Central', 'Golden, sugary sweet corn picked at peak morning sweetness.', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80', 3.10, 'Harvested this morning', true)
on conflict do nothing;

-- Seed Sample Delivery Request
insert into public.deliveries (
  id, tracking_code, handover_pin, farmer_name, farmer_phone, buyer_name, buyer_phone,
  pickup, dropoff, goods, vehicle_required, distance_km, estimated_minutes,
  customer_delivery_fee, driver_earnings, platform_fee, status, status_history
)
values (
  'DLV-10285', 'AGRI-5921-LK', '4821', 'Sarah Jenkins', '+94 77 234 5678', 'Elena Rostova', '+94 71 888 9999',
  '{"address": "Kandy Highland Orchards Gate A", "lat": 7.290, "lng": 80.633, "contactName": "Sarah Jenkins", "contactPhone": "+94 77 234 5678"}'::jsonb,
  '{"address": "Central Market Stall #14, Colombo 03", "lat": 6.902, "lng": 79.858, "contactName": "Elena Rostova", "contactPhone": "+94 71 888 9999"}'::jsonb,
  '{"name": "Crisp Fuji Apples", "category": "Fruits", "quantity": "85 kg", "unit": "kg", "packageCount": 6, "weightKg": 85, "specialHandling": "Padded crates. Keep dry and ventilated."}'::jsonb,
  'Van', 18.0, 38, 2600, 2132, 468, 'Searching for Driver',
  '[{"status": "Delivery Requested", "timestamp": 1759300000000, "actor": "Buyer (Elena Rostova)"}, {"status": "Searching for Driver", "timestamp": 1759300060000, "actor": "System Matcher"}]'::jsonb
)
on conflict (id) do nothing;
