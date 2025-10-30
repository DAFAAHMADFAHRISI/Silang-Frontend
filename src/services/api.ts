import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('nama');
          localStorage.removeItem('role');
          localStorage.removeItem('user_id');
          window.location.href = '/Login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Get auth error data
  getAuthError: async (params: {
    error: string;
    email: string;
    name?: string;
    picture?: string;
    googleId?: string;
  }) => {
    try {
      const response = await api.get('/auth-error', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch auth error data:', error);
      throw error;
    }
  },

  // Google OAuth callback
  googleCallback: async (code: string) => {
    try {
      const response = await api.post('/auth/google/callback', { code });
      return response.data;
    } catch (error) {
      console.error('Google OAuth callback failed:', error);
      throw error;
    }
  },

  // Login
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Register
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('nama');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      return response.data;
    } catch (error) {
      console.error('Logout failed:', error);
      // Still remove token even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('nama');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post('/api/auth/reset-password', { 
        token, 
        newPassword: newPassword 
      });
      return response.data;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  },
};

// Landing Page API endpoints
export const landingPageAPI = {
  // Get institusi data
  getInstitusi: async () => {
    try {
      const response = await api.get('/api/landingpage/institusi');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch institusi data:', error);
      throw error;
    }
  },

  // Get siswa aktif data
  getSiswaAktif: async () => {
    try {
      const response = await api.get('/api/landingpage/siswa-aktif');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch siswa aktif data:', error);
      throw error;
    }
  },

  // Get siswa tidak aktif data
  getSiswaTidakAktif: async () => {
    try {
      const response = await api.get('/api/landingpage/siswa-tidak-aktif');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch siswa tidak aktif data:', error);
      throw error;
    }
  },

  // Get guru data
  getGuru: async () => {
    try {
      const response = await api.get('/api/landingpage/guru');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch guru data:', error);
      throw error;
    }
  },

  // Get magang dates data
  getMagangDates: async () => {
    try {
      const response = await api.get('/api/landingpage/magang-dates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch magang dates data:', error);
      throw error;
    }
  },
};

// Root API endpoint
export const rootAPI = {
  // Get root endpoint data
  getRoot: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch root data:', error);
      throw error;
    }
  },
};

// Superadmin Certificate API
export const certificateAPI = {
  getGraduatedStudents: async (): Promise<{ success: boolean; data: Array<{ id: number; nama: string; institusi?: string; tanggal_mulai_magang?: string; tanggal_selesai_magang?: string; status?: string }>; }> => {
    const response = await api.get('/api/superadmin/graduated-students');
    return response.data;
  },

  getCertificatePdfUrl: (siswaId: number): string => {
    return `${api.defaults.baseURL || ''}/api/superadmin/certificate/${siswaId}.pdf`;
  },

  // Siswa endpoints
  getSiswaMagangStatus: async (): Promise<{ success: boolean; data: { status: string; status_magang: string; tanggal_mulai_magang?: string; tanggal_selesai_magang?: string; nama: string; id: number } }> => {
    const response = await api.get('/api/siswa/magang-status');
    return response.data;
  },

  getOwnCertificatePdfUrl: (): string => {
    return `${api.defaults.baseURL || ''}/api/siswa/certificate.pdf`;
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nama');
  localStorage.removeItem('role');
  localStorage.removeItem('user_id');
  delete api.defaults.headers.common['Authorization'];
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export default api;
