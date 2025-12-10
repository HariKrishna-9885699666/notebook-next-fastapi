# Supabase Migrations

This folder contains SQL migrations for the SupaNote database schema.

## Migrations

1. **20241210000001_create_tables.sql** - Creates the core tables:
   - `notes` - Stores user notes with title, content, and folder association
   - `folders` - Stores user folders for organizing notes
   - Includes RLS (Row Level Security) policies to ensure users can only access their own data

2. **20241210000002_create_storage.sql** - Sets up storage:
   - Creates `note-images` bucket for storing uploaded images
   - Sets up storage RLS policies for secure file access

## Running Migrations

### Local Development (Supabase CLI)

```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db reset
```

### Production (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order

### Using Supabase Migration Commands

```bash
# Create a new migration
supabase migration new <migration_name>

# Apply pending migrations
supabase db push

# Reset database (drops all data)
supabase db reset
```

## Schema Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│       folders       │     │        notes        │
├─────────────────────┤     ├─────────────────────┤
│ id (uuid, PK)       │◄────┤ folder_id (uuid, FK)│
│ user_id (uuid, FK)  │     │ id (uuid, PK)       │
│ name (text)         │     │ user_id (uuid, FK)  │
│ created_at          │     │ title (text)        │
└─────────────────────┘     │ content (text)      │
                            │ created_at          │
                            │ updated_at          │
                            └─────────────────────┘
```

## RLS Policies

All tables have Row Level Security enabled with policies that:
- Allow users to SELECT, INSERT, UPDATE, DELETE only their own records
- Use `auth.uid()` to identify the current user
