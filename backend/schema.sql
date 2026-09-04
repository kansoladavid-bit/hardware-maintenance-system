-- Hardware Maintenance Request System - Database Schema
-- Run this inside Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  reference_code VARCHAR(20) UNIQUE NOT NULL,
  reporter_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  equipment_name VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  issue_description TEXT NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved')),
  technician_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-update the updated_at column whenever a row changes
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requests_updated_at ON requests;
CREATE TRIGGER trg_requests_updated_at
BEFORE UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
