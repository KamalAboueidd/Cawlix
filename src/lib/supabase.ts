/**
 * Cawlix Telemetry — Supabase Client Wrapper
 * High-performance, zero-bloat authentication and database client.
 */

interface AuthResponse {
  data: any;
  error: Error | null;
}

class SupabaseAuthClient {
  private url: string;
  private anonKey: string;

  constructor(url: string, anonKey: string) {
    this.url = (url || 'https://mock.supabase.co').replace(/\/$/, '');
    this.anonKey = anonKey || 'anon-key-placeholder';
  }

  async signInWithOAuth({ provider, options }: { provider: 'google'; options?: { redirectTo?: string } }): Promise<AuthResponse> {
    try {
      const redirectUri = options?.redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/tracker` : 'https://cawlix.com/tracker');
      
      if (this.url.includes('mock.supabase.co')) {
        // Mock / Local preview redirection
        if (typeof window !== 'undefined') {
          localStorage.setItem('cawlix_auth_session', JSON.stringify({ user: { email: 'engineer@cawlix.com', provider: 'google' } }));
          window.location.href = redirectUri;
        }
        return { data: { provider, url: redirectUri }, error: null };
      }

      const authUrl = `${this.url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUri)}`;
      if (typeof window !== 'undefined') {
        window.location.href = authUrl;
      }
      return { data: { provider, url: authUrl }, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
    try {
      if (this.url.includes('mock.supabase.co')) {
        if (!email.includes('@')) throw new Error('Invalid email address format.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('cawlix_auth_session', JSON.stringify({ user: { email } }));
        }
        return { data: { user: { email } }, error: null };
      }

      const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.msg || json.error_description || json.message || 'Authentication failed.');
      }
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async signInWithOtp({ email, options }: { email: string; options?: { emailRedirectTo?: string } }): Promise<AuthResponse> {
    try {
      if (this.url.includes('mock.supabase.co')) {
        if (!email.includes('@')) throw new Error('Invalid email address format.');
        return { data: { message: 'Magic link dispatched.' }, error: null };
      }

      const res = await fetch(`${this.url}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          create_user: false,
          data: {},
          redirect_to: options?.emailRedirectTo,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.msg || json.error_description || json.message || 'Failed to dispatch magic link.');
      }
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async signUp({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
    try {
      if (this.url.includes('mock.supabase.co')) {
        if (!email.includes('@')) throw new Error('Invalid email address format.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('cawlix_auth_session', JSON.stringify({ user: { email } }));
        }
        return { data: { user: { email } }, error: null };
      }

      const res = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.msg || json.error_description || json.message || 'Registration failed.');
      }
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async signOut(): Promise<AuthResponse> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cawlix_auth_session');
    }
    return { data: null, error: null };
  }
}

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_URL) || 'https://mock.supabase.co';
const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_ANON_KEY) || 'anon-key';

export const supabase = {
  auth: new SupabaseAuthClient(supabaseUrl, supabaseKey),
};
