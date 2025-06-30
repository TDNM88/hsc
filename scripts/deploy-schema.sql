-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS neon_auth;

-- Create users_sync table
CREATE TABLE IF NOT EXISTS neon_auth.users_sync (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    raw_json JSONB DEFAULT '{}'::jsonb
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS neon_auth.user_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT,
    balance DECIMAL(15,2) DEFAULT 0.00,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_verified BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS neon_auth.login_attempts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES neon_auth.users_sync(id) ON DELETE SET NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS neon_auth.transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade')),
    amount DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'PENDING',
    description TEXT,
    reference_id TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rounds table
CREATE TABLE IF NOT EXISTS neon_auth.rounds (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    start_price DECIMAL(15,8),
    end_price DECIMAL(15,8),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

-- Create trades table
CREATE TABLE IF NOT EXISTS neon_auth.trades (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
    round_id TEXT NOT NULL REFERENCES neon_auth.rounds(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('UP', 'DOWN')),
    amount DECIMAL(15,2) NOT NULL,
    entry_price DECIMAL(15,8) NOT NULL,
    close_price DECIMAL(15,8),
    multiplier DECIMAL(5,2) DEFAULT 1.95,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'WON', 'LOST', 'CANCELED')),
    payout DECIMAL(15,2) DEFAULT 0.00,
    profit DECIMAL(15,2),
    result TEXT,
    duration INTEGER NOT NULL,
    open_time TIMESTAMPTZ DEFAULT NOW(),
    close_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_sync_email ON neon_auth.users_sync(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON neon_auth.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON neon_auth.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON neon_auth.login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON neon_auth.login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON neon_auth.login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON neon_auth.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON neon_auth.transactions(status);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON neon_auth.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_round_id ON neon_auth.trades(round_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON neon_auth.trades(status);
CREATE INDEX IF NOT EXISTS idx_rounds_status ON neon_auth.rounds(status);
CREATE INDEX IF NOT EXISTS idx_rounds_start_time ON neon_auth.rounds(start_time);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION neon_auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_sync_updated_at ON neon_auth.users_sync;
CREATE TRIGGER update_users_sync_updated_at 
    BEFORE UPDATE ON neon_auth.users_sync 
    FOR EACH ROW EXECUTE FUNCTION neon_auth.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON neon_auth.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON neon_auth.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION neon_auth.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON neon_auth.transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON neon_auth.transactions 
    FOR EACH ROW EXECUTE FUNCTION neon_auth.update_updated_at_column();

DROP TRIGGER IF EXISTS update_trades_updated_at ON neon_auth.trades;
CREATE TRIGGER update_trades_updated_at 
    BEFORE UPDATE ON neon_auth.trades 
    FOR EACH ROW EXECUTE FUNCTION neon_auth.update_updated_at_column();
