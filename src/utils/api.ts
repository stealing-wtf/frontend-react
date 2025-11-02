const API_BASE = 'http://localhost:8000';

export interface User {
  uuid: number;
  username: string;
  premium: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  requiresOTP?: boolean;
  premium?: boolean;
  message?: string;
  userId?: number;
  user?: {
    uuid: number;
    username: string;
    premium: boolean;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async register(username: string, email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });
  }

  async login(credentials: { email?: string; username?: string; password: string }): Promise<AuthResponse> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async loginEmail(email: string): Promise<AuthResponse & { userId?: number }> {
    return this.request('/api/v1/auth/login-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyOTP(userId: number, code: string): Promise<AuthResponse> {
    return this.request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ userId, code })
    });
  }
}

export const apiClient = new ApiClient();

// Export convenience functions
export const register = (username: string, email: string, password: string, confirmPassword: string) => 
  apiClient.register(username, email, password, confirmPassword);
export const login = (credentials: { email?: string; username?: string; password: string }) => 
  apiClient.login(credentials);
export const loginEmail = (email: string) => apiClient.loginEmail(email);
export const verifyOTP = (userId: number, code: string) => apiClient.verifyOTP(userId, code);