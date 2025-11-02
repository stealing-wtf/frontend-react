import CookieService from './cookieService';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface OTPRequest {
  userId: string;
  otp: string;
}

export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  isStarred: boolean;
  isShared: boolean;
  thumbnail?: string;
  folder?: string;
  shareId?: string;
  views: number;
  likes: number;
  dislikes: number;
}

export interface SharedFile {
  id: string;
  fileId: string;
  shareId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  views: number;
  likes: number;
  dislikes: number;
  isPublic: boolean;
}

export interface FileAnalytics {
  fileId: string;
  fileName: string;
  views: number;
  likes: number;
  dislikes: number;
  shares: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topCountries: string[];
  topReferrers: string[];
}

export interface LikeAction {
  action: 'like' | 'dislike' | 'remove';
}

export interface UserStats {
  totalFiles: number;
  storageUsed: number;
  sharedFiles: number;
  totalDownloads: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  isPremium: boolean;
  storageLimit: number;
  storageUsed: number;
  createdAt: string;
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Generic request method with automatic token handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = CookieService.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle token expiration
      if (response.status === 401) {
        const refreshToken = CookieService.getRefreshToken();
        if (refreshToken) {
          const refreshResult = await this.refreshAuthToken(refreshToken);
          if (refreshResult.success) {
            // Retry original request with new token
            const newToken = CookieService.getAuthToken();
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const retryData = await retryResponse.json();
            return {
              success: retryResponse.ok,
              data: retryData,
              message: retryData.message,
              error: retryResponse.ok ? undefined : retryData.error || 'Request failed',
            };
          } else {
            // Refresh failed, clear auth data and redirect to login
            CookieService.clearAuthData();
            window.location.href = '/login';
            return { success: false, error: 'Authentication expired' };
          }
        } else {
          CookieService.clearAuthData();
          window.location.href = '/login';
          return { success: false, error: 'Authentication required' };
        }
      }

      const data = await response.json();
      
      console.log('📦 Raw API response data:', data);
      console.log('✅ Response status:', response.status, response.ok);
      
      return {
        success: response.ok,
        data,
        message: data.message,
        error: response.ok ? undefined : data.error || 'Request failed',
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<{ token?: string; refreshToken?: string; user?: UserProfile; requiresOTP?: boolean; userId?: string; data?: any }>> {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      // Handle both direct and nested response structures
      const responseData = response.data.data || response.data;
      
      // Handle tokens structure from backend
      if (responseData.tokens?.access_token) {
        CookieService.setAuthToken(responseData.tokens.access_token);
        if (responseData.tokens.refresh_token) {
          CookieService.setRefreshToken(responseData.tokens.refresh_token);
        }
      }
      // Fallback for direct token structure
      else if (responseData.token) {
        CookieService.setAuthToken(responseData.token);
        if (responseData.refreshToken) {
          CookieService.setRefreshToken(responseData.refreshToken);
        }
      }
      
      if (responseData.user) {
        CookieService.setUserData(responseData.user);
      }
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ success: boolean; data: { message: string; requiresOTP?: boolean; userId?: string } }>> {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyOTP(otpData: OTPRequest): Promise<ApiResponse<{ token: string; refreshToken: string; user: UserProfile }>> {
    console.log('DEBUG: apiService.verifyOTP called with:', otpData);
    const response = await this.request<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
    
    console.log('DEBUG: apiService.verifyOTP raw response:', response);

    if (response.success && response.data?.data) {
      console.log('DEBUG: Processing successful response with nested data');
      // Handle nested response structure from backend
      const { tokens, user } = response.data.data;
      
      console.log('DEBUG: Extracted tokens:', tokens);
      console.log('DEBUG: Extracted user:', user);
      
      if (tokens?.access_token) {
        console.log('DEBUG: Setting auth token:', tokens.access_token);
        CookieService.setAuthToken(tokens.access_token);
        if (tokens.refresh_token) {
          console.log('DEBUG: Setting refresh token:', tokens.refresh_token);
          CookieService.setRefreshToken(tokens.refresh_token);
        }
      }
      
      if (user) {
        console.log('DEBUG: Setting user data:', user);
        CookieService.setUserData(user);
      }
      
      // Return flattened structure for compatibility
      const flattenedResponse = {
        ...response,
        data: {
          token: tokens?.access_token || '',
          refreshToken: tokens?.refresh_token || '',
          user: user
        }
      };
      
      console.log('DEBUG: Returning flattened response:', flattenedResponse);
      return flattenedResponse;
    } else if (response.success && response.data) {
      console.log('DEBUG: Response successful but checking for direct structure');
      // Maybe the response is not nested - check direct structure
      if (response.data.user || response.data.token) {
        console.log('DEBUG: Found direct structure, using as-is');
        return response;
      }
    }

    console.log('DEBUG: Response not successful or missing data:', response);
    return response;
  }

  async refreshAuthToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    const response = await this.request<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success && response.data) {
      if (response.data.token) {
        CookieService.setAuthToken(response.data.token);
      }
      if (response.data.refreshToken) {
        CookieService.setRefreshToken(response.data.refreshToken);
      }
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    CookieService.clearAuthData();
    return response;
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/users/profile');
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return this.request<UserStats>('/users/stats');
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // File methods
  async getFiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ files: FileItem[]; total: number; page: number; totalPages: number }>> {
    console.log('🔍 ApiService.getFiles called with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/files/?${queryString}` : '/files/';
    
    console.log('📡 Making request to endpoint:', endpoint);
    
    const response = await this.request<any>(endpoint);
    console.log('📥 ApiService.getFiles response:', response);
    
    // Handle the nested data structure from the backend
    if (response.success && response.data && response.data.data) {
      return {
        success: true,
        data: response.data.data, // Extract the nested data
        message: response.message,
        error: response.error
      };
    }
    
    return response;
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    const token = CookieService.getAuthToken();

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: xhr.status >= 200 && xhr.status < 300,
            data: response,
            message: response.message,
            error: xhr.status >= 400 ? response.error || 'Upload failed' : undefined,
          });
        } catch {
          resolve({
            success: false,
            error: 'Invalid response format',
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Upload failed',
        });
      });

      xhr.open('POST', `${API_BASE_URL}/files/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  async deleteFile(fileId: string): Promise<ApiResponse> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async shareFile(fileId: string, shared: boolean): Promise<ApiResponse<any>> {
    return this.request<any>(`/files/${fileId}/share`, {
      method: 'PUT',
      body: JSON.stringify({ shared }),
    });
  }

  async starFile(fileId: string, starred: boolean): Promise<ApiResponse<FileItem>> {
    return this.request<FileItem>(`/files/${fileId}/star`, {
      method: 'PUT',
      body: JSON.stringify({ starred }),
    });
  }

  async renameFile(fileId: string, newName: string): Promise<ApiResponse<FileItem>> {
    return this.request<FileItem>(`/files/${fileId}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName }),
    });
  }

  async downloadFile(fileId: string): Promise<ApiResponse<Blob>> {
    const token = CookieService.getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        return {
          success: true,
          data: blob,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Download failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  async getFilePreview(fileId: string): Promise<ApiResponse<string>> {
    return this.request<string>(`/files/${fileId}/preview`);
  }

  // Sharing methods
  async createShareLink(fileId: string): Promise<ApiResponse<{shareId: string, shareUrl: string}>> {
    return this.request<{shareId: string, shareUrl: string}>(`/files/${fileId}/share`, {
      method: 'POST',
    });
  }

  async getSharedFile(shareId: string): Promise<ApiResponse<SharedFile>> {
    // This endpoint doesn't require authentication
    try {
      const response = await fetch(`${API_BASE_URL}/files/share/${shareId}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.detail || 'Failed to get shared file',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get shared file',
      };
    }
  }

  async likeSharedFile(shareId: string, action: LikeAction): Promise<ApiResponse<{likes: number, dislikes: number, userReaction: string | null}>> {
    return this.request<{likes: number, dislikes: number, userReaction: string | null}>(`/files/share/${shareId}/like`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async getFileAnalytics(fileId: string): Promise<ApiResponse<FileAnalytics>> {
    return this.request<FileAnalytics>(`/files/${fileId}/analytics`);
  }

  async getSharedFilePreview(shareId: string): Promise<string> {
    // Return the direct URL for shared file preview (no auth required)
    return `${API_BASE_URL}/files/share/${shareId}/preview`;
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
export default apiService;