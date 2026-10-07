/**
 * Cawlix Telemetry — Supabase Client Wrapper
 * High-performance, zero-bloat authentication and database client.
 */

interface AuthResponse {
  data: any;
  error: Error | null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

class SupabaseAuthClient {
  private url: string;
  private anonKey: string;

  constructor(url: string, anonKey: string) {
    this.url = (url || 'https://dbrzkjlklfrusiapoqua.supabase.co').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    this.anonKey = anonKey || 'sb_publishable_NrX9K6Bx961f83I6VCpXNQ_r_smwTHz';
  }

  async signInWithOAuth({ provider, options }: { provider: 'google'; options?: { redirectTo?: string } }): Promise<AuthResponse> {
    try {
      const redirectUri = options?.redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/console` : 'https://cawlix.com/console');
      
      if (this.url.includes('mock.supabase.co')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('cawlix_auth_session', JSON.stringify({ user: { email: 'developer@cawlix.com', provider: 'google' } }));
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
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        throw new Error('Please enter a valid work or personal email address.');
      }
      if (!password) {
        throw new Error('Please enter your password.');
      }

      if (this.url.includes('mock.supabase.co')) {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }

        if (typeof window !== 'undefined') {
          // Check registered users in storage
          const rawUsers = localStorage.getItem('cawlix_registered_users');
          const users = rawUsers ? JSON.parse(rawUsers) : {};
          
          if (users[cleanEmail] && users[cleanEmail] !== password) {
            throw new Error('Invalid login credentials. Please check your password.');
          }
          
          localStorage.setItem('cawlix_auth_session', JSON.stringify({ user: { email: cleanEmail } }));
        }
        return { data: { user: { email: cleanEmail } }, error: null };
      }

      const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.msg || json.error_description || json.message || 'Authentication failed.');
      }
      if (typeof window !== 'undefined') {
        const session = {
          access_token: json.access_token,
          refresh_token: json.refresh_token,
          user: json.user || { email: cleanEmail },
        };
        localStorage.setItem('cawlix_auth_session', JSON.stringify({ session, user: session.user }));
      }
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async signInWithOtp({ email, options }: { email: string; options?: { emailRedirectTo?: string } }): Promise<AuthResponse> {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        throw new Error('Please enter a valid work or personal email address to receive OTP/magic link.');
      }

      if (this.url.includes('mock.supabase.co')) {
        return { data: { message: `Magic link dispatched to ${cleanEmail}.` }, error: null };
      }

      const res = await fetch(`${this.url}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
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
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        throw new Error('Please enter a valid work or personal email address.');
      }
      if (!password || password.length < 8) {
        throw new Error('Password must contain at least 8 characters.');
      }
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        throw new Error('Password must contain both letters and numbers.');
      }

      if (this.url.includes('mock.supabase.co')) {
        if (typeof window !== 'undefined') {
          const rawUsers = localStorage.getItem('cawlix_registered_users');
          const users = rawUsers ? JSON.parse(rawUsers) : {};
          users[cleanEmail] = password;
          localStorage.setItem('cawlix_registered_users', JSON.stringify(users));
          localStorage.setItem('cawlix_auth_session', JSON.stringify({ user: { email: cleanEmail } }));
        }
        return { data: { user: { email: cleanEmail } }, error: null };
      }

      const res = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.msg || json.error_description || json.message || 'Registration failed.');
      }
      if (typeof window !== 'undefined') {
        const session = {
          access_token: json.access_token,
          refresh_token: json.refresh_token,
          user: json.user || { email: cleanEmail },
        };
        localStorage.setItem('cawlix_auth_session', JSON.stringify({ session, user: session.user }));
      }
      return { data: json, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async getSession(): Promise<{ data: { session: any | null }; error: Error | null }> {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('cawlix_auth_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          const session = parsed.session || parsed;
          return { data: { session }, error: null };
        }
      }
      return { data: { session: null }, error: null };
    } catch (err: any) {
      return { data: { session: null }, error: err };
    }
  }

  async getUser(): Promise<{ data: { user: any | null }; error: Error | null }> {
    const sessionRes = await this.getSession();
    const user = sessionRes.data.session?.user || null;
    return { data: { user }, error: sessionRes.error };
  }

  async signOut(): Promise<AuthResponse> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cawlix_auth_session');
    }
    return { data: null, error: null };
  }
}

export interface TrackedProduct {
  id: string;
  sku: string;
  title: string;
  node: string;
  domain: string;
  current_price_egp: number;
  baseline_price_egp: number;
  delta_pct: number;
  discount_status: string;
  status: 'ACTIVE' | 'FLAGGED' | 'STABLE';
  last_ping: string;
  created_at: string;
}

const DEFAULT_TRACKED_PRODUCTS: TrackedProduct[] = [
  {
    id: 'tp-1',
    sku: 'caw_sku_981a',
    title: 'MacBook Pro 14" M3 Pro 18GB/512GB',
    node: 'AMZN_EG',
    domain: 'node.amazon.eg',
    current_price_egp: 94500,
    baseline_price_egp: 88200,
    delta_pct: 7.1,
    discount_status: 'CRITICAL MARKUP (+7.1%)',
    status: 'FLAGGED',
    last_ping: '4m ago',
    created_at: '2026-10-02T10:00:00Z',
  },
  {
    id: 'tp-2',
    sku: 'caw_sku_442e',
    title: 'Sony A7 IV Mirrorless Camera Body',
    node: 'BH_US',
    domain: 'node.bhphotovideo.us',
    current_price_egp: 122400,
    baseline_price_egp: 144000,
    delta_pct: -15.0,
    discount_status: 'ARBITRAGE ADVANTAGE (-15.0%)',
    status: 'ACTIVE',
    last_ping: '12m ago',
    created_at: '2026-10-01T14:30:00Z',
  },
  {
    id: 'tp-3',
    sku: 'caw_sku_719b',
    title: 'Apple iPhone 16 Pro 256GB Natural Titanium',
    node: 'AMZN_EG',
    domain: 'node.amazon.eg',
    current_price_egp: 64900,
    baseline_price_egp: 67800,
    delta_pct: -4.2,
    discount_status: 'VERIFIED DEAL (-4.2%)',
    status: 'ACTIVE',
    last_ping: '19m ago',
    created_at: '2026-09-28T09:15:00Z',
  },
  {
    id: 'tp-4',
    sku: 'caw_sku_305d',
    title: 'Samsung 65" QN90C Neo QLED 4K HDR',
    node: 'NOON_EG',
    domain: 'node.noon.eg',
    current_price_egp: 29400,
    baseline_price_egp: 28500,
    delta_pct: 3.1,
    discount_status: 'MODERATE SPIKE (+3.1%)',
    status: 'STABLE',
    last_ping: '34m ago',
    created_at: '2026-09-25T11:00:00Z',
  },
  {
    id: 'tp-5',
    sku: 'caw_sku_118k',
    title: 'Sony WH-1000XM5 Wireless Headphones',
    node: 'BTECH_EG',
    domain: 'node.btech.eg',
    current_price_egp: 18900,
    baseline_price_egp: 19500,
    delta_pct: -3.1,
    discount_status: 'VERIFIED DEAL (-3.1%)',
    status: 'ACTIVE',
    last_ping: '1h ago',
    created_at: '2026-09-20T16:45:00Z',
  },
];

class SupabaseTableBuilder<T> {
  private tableName: string;
  private url: string;
  private anonKey: string;

  constructor(tableName: string, url: string, anonKey: string) {
    this.tableName = tableName;
    this.url = (url || 'https://dbrzkjlklfrusiapoqua.supabase.co').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    this.anonKey = anonKey || 'sb_publishable_NrX9K6Bx961f83I6VCpXNQ_r_smwTHz';
  }

  async select(_columns = '*'): Promise<{ data: T[] | null; error: Error | null }> {
    try {
      if (this.url.includes('mock.supabase.co')) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem(`cawlix_${this.tableName}`);
          if (raw) {
            return { data: JSON.parse(raw), error: null };
          }
        }
        if (this.tableName === 'tracked_products') {
          return { data: DEFAULT_TRACKED_PRODUCTS as unknown as T[], error: null };
        }
        return { data: [], error: null };
      }

      const res = await fetch(`${this.url}/rest/v1/${this.tableName}?select=*`, {
        headers: {
          apikey: this.anonKey,
          Authorization: `Bearer ${this.anonKey}`,
        },
      });
      if (!res.ok) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem(`cawlix_${this.tableName}`);
          if (raw) {
            return { data: JSON.parse(raw), error: null };
          }
        }
        if (this.tableName === 'tracked_products') {
          return { data: DEFAULT_TRACKED_PRODUCTS as unknown as T[], error: null };
        }
        throw new Error(`Failed to fetch from ${this.tableName}`);
      }
      const json = await res.json();
      return { data: json, error: null };
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(`cawlix_${this.tableName}`);
        if (raw) {
          return { data: JSON.parse(raw), error: null };
        }
      }
      if (this.tableName === 'tracked_products') {
        return { data: DEFAULT_TRACKED_PRODUCTS as unknown as T[], error: null };
      }
      return { data: null, error: err };
    }
  }

  async insert(record: Partial<T>): Promise<{ data: T | null; error: Error | null }> {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(`cawlix_${this.tableName}`);
        const list = raw ? JSON.parse(raw) : (this.tableName === 'tracked_products' ? [...DEFAULT_TRACKED_PRODUCTS] : []);
        list.unshift(record);
        localStorage.setItem(`cawlix_${this.tableName}`, JSON.stringify(list));
      }

      if (!this.url.includes('mock.supabase.co')) {
        await fetch(`${this.url}/rest/v1/${this.tableName}`, {
          method: 'POST',
          headers: {
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(record),
        }).catch(() => {});
      }

      return { data: record as T, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

export { supabase, default } from './supabaseClient.js';

export interface TrackedProduct {
  id: string;
  sku: string;
  title: string;
  node: string;
  domain?: string;
  current_price_egp: number;
  baseline_price_egp: number;
  delta_pct: number;
  discount_status: string;
  status: string;
  last_ping: string;
  created_at?: string;
}

