import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const RAILWAY_URL = 'https://anonyrant-backend-production.up.railway.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: RAILWAY_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ErrorResponse {
  message?: string;
  error?: string;
}

// Add request interceptor for logging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ensure the URL is absolute
    if (config.url && !config.url.startsWith('http')) {
      config.url = RAILWAY_URL + '/api' + config.url;
    }
    console.log('Making request to:', config.url);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    console.error('Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      }
    });

    // Extract the most relevant error message
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      `${error.response?.status || 'Error'}: ${error.response?.statusText || error.message}` || 
      'An unexpected error occurred';
    
    return Promise.reject(new Error(message));
  }
);

export enum ReactionType {
  EMPATHY = 'EMPATHY',
  SUPPORT = 'SUPPORT',
  HUG = 'HUG',
  ANGRY = 'ANGRY',
  SAD = 'SAD'
}

// Types based on your backend DTOs
export interface CreateRantDto {
  title: string;
  content: string;
  anonymousId: string;
}

export interface CreateCommentDto {
  content: string;
  anonymousId: string;
  rantId: string;
}

export interface CreateReactionDto {
  type: ReactionType;
  anonymousId: string;
  rantId: string;
}

export interface SearchRantsParams {
  search?: string;
  reactionType?: ReactionType;
  sortBy?: 'createdAt' | 'reactions' | 'comments';
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  take?: number;
}

// API functions
export const apiClient = {
  rants: {
    create: (data: CreateRantDto) => 
      api.post('/rants', data),
    getAll: (params: SearchRantsParams = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      return api.get(`/rants?${queryParams.toString()}`);
    },
    getOne: (id: string) => 
      api.get(`/rants/${id}`),
    getRandom: () =>
      api.get('/rants/random'),
    delete: (id: string, anonymousId: string) => 
      api.delete(`/rants/${id}?anonymousId=${anonymousId}`),
  },
  
  comments: {
    create: (data: CreateCommentDto) => 
      api.post('/comments', data),
    getByRantId: (rantId: string, skip = 0, take = 20) => 
      api.get(`/comments/rant/${rantId}?skip=${skip}&take=${take}`),
    delete: (id: string, anonymousId: string) => 
      api.delete(`/comments/${id}?anonymousId=${anonymousId}`),
  },
  
  reactions: {
    toggle: (data: CreateReactionDto) => 
      api.post('/reactions', data),
    getByRantId: (rantId: string) => 
      api.get(`/reactions/rant/${rantId}`),
  },
}; 