import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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