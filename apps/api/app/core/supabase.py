from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Client:
    """Get a Supabase client with the anon key (for authenticated requests)."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_supabase_admin_client() -> Client:
    """Get a Supabase client with the service role key (for admin operations)."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
