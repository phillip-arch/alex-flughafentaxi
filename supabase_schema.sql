-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Create Auth Rate Limits Table
CREATE TABLE public.auth_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address TEXT,
    email TEXT,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- 1. Create Profiles Table (for Role Management)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create ZIP Prices Table
CREATE TABLE public.zip_prices (
    zip TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    base_price NUMERIC NOT NULL,
    limo_price NUMERIC,
    kombi_price NUMERIC,
    bus_price NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 Create Drivers Table
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Bookings Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest bookings
    booking_reference TEXT NOT NULL,
    confirm_token UUID UNIQUE NOT NULL,
    confirmed_at TIMESTAMPTZ,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    pickup TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_at TIMESTAMPTZ NOT NULL,
    passengers INTEGER NOT NULL,
    luggage INTEGER NOT NULL,
    vehicle_type TEXT NOT NULL,
    price NUMERIC NOT NULL,
    ip_address TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'Wartet auf Bestätigung')),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bookings_booking_reference_key UNIQUE (booking_reference)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zip_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Create Admin Helper Function
-- This function checks if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies for Profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());
-- Users can update their own profile (but not their role)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 7. RLS Policies for ZIP Prices
-- Anyone can read prices (needed for the booking form)
CREATE POLICY "Anyone can view prices" ON public.zip_prices
    FOR SELECT USING (true);
-- Only admins can modify prices
CREATE POLICY "Admins can insert prices" ON public.zip_prices
    FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update prices" ON public.zip_prices
    FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete prices" ON public.zip_prices
    FOR DELETE USING (public.is_admin());

-- 7.5 RLS Policies for Drivers
-- Only admins can manage drivers
CREATE POLICY "Admins can manage drivers" ON public.drivers
    FOR ALL USING (public.is_admin());

-- 8. RLS Policies for Bookings
-- Anyone can insert a booking (guests and logged-in users)
CREATE POLICY "Anyone can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (status = 'pending' AND confirm_token IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);
-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT USING (public.is_admin());
-- Users can update their own bookings (e.g., to cancel)
CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);
-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings" ON public.bookings
    FOR UPDATE USING (public.is_admin());
-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings" ON public.bookings
    FOR DELETE USING (public.is_admin());

-- 9. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'customer' -- Default role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
