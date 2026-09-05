# Hardware Maintenance Request System

A simple web-based system for reporting, tracking, and managing hardware maintenance requests (computers, printers, projectors, network equipment, etc.) — built as an Industrial Practical Training (IPT) / Field project for the MUST ICT Course.


## Live Demo

- **Frontend:** https://dreamy-heliotrope-24d47a.netlify.app
- **Backend API:** https://hardware-maintenance-system.onrender.com
## Overview

The system has two sides:

- **Requesters** (students/staff) — report a broken piece of equipment without needing an account, and track the status of their request later using a reference code.
- **Admin/Technician** — logs in securely to view all requests, filter/search them, update status, add technician notes, and delete resolved/duplicate entries.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (hosted on Supabase)
- **Frontend:** Plain HTML, CSS, and vanilla JavaScript (no framework)
- **Authentication:** JWT (JSON Web Tokens) + bcrypt password hashing
- **Version control:** Git + GitHub

## Features

- Submit a maintenance request without login (auto-generates a unique reference code, e.g. `HMR-2026-0001`)
- Track request status anytime using the
## Project Structure

## Database Schema

Two tables (see `backend/schema.sql`):

- **admins** — id, username, password_hash, created_at
- **requests** — id, reference_code, reporter_name, department, contact_info, equipment_name, location, issue_description, priority, status, technician_notes, created_at, updated_at (auto-updated via trigger)
## Setup Instructions

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Set up the database (Supabase)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor**, paste the contents of `backend/schema.sql`, and run it — this creates the `admins` and `requests` tables
3. Go to **Project Settings → Database**, copy the **Connection string (URI)** — this is your `DATABASE_URL`

### 3. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:
## Usage

- **Report a problem:** Home → "Report a Problem" → fill the form → save the reference code shown
- **Track a request:** Home → "Track My Request" → enter the reference code
- **Admin:** "Admin Login" → dashboard shows all requests with filters, status updates, technician notes, and delete

## Security Notes

- Passwords are hashed with bcrypt before storage — never stored in plain text
- Admin sessions use JWT tokens (8-hour expiry)
- The `/api/auth/register` endpoint is disabled after initial setup to prevent unauthorized admin account creation
- `.env` (containing `DATABASE_URL` and `JWT_SECRET`) is excluded from version control via `.gitignore`
- CORS restricts API access to the configured frontend origin(s) only

## Author

David Kansola — MUST ICT Course, Industrial Practical Training (IPT) project
