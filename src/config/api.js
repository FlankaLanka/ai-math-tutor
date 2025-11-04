/**
 * API configuration
 * Uses environment variable for API URL, falls back to localhost for development
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  chat: `${API_URL}/api/chat`,
  vision: `${API_URL}/api/vision`,
  validate: `${API_URL}/api/validate`,
  tts: `${API_URL}/api/tts`,
};

