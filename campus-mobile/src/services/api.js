import { Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080/api' 
  : 'http://192.168.1.7:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 403 Forbidden (Expired Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 403) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Note: You might want to use a global state or navigation ref to redirect to Login
      Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.post('/users/profile', data);
    return response.data;
  },
  updatePassword: async (data) => {
    const response = await api.put('/users/password', data);
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },
  uploadProfileImage: async (imageUri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
    const response = await api.post('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};

export const challengeService = {
  getAll: async () => {
    const response = await api.get('/challenges');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },
  create: async (challengeData) => {
    const response = await api.post('/challenges', challengeData);
    return response.data;
  }
};

export const submissionService = {
  getByChallengeId: async (challengeId) => {
    const response = await api.get(`/submissions/${challengeId}`);
    return response.data;
  },
  create: async (challengeId, data) => {
    if (data.type === 'text') {
      const formData = new FormData();
      formData.append('content', data.content);
      const response = await api.post(`/submissions/${challengeId}/text`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      const formData = new FormData();
      formData.append('file', {
        uri: data.attachmentUri,
        type: data.type === 'audio' ? 'audio/mpeg' : 'image/jpeg',
        name: data.type === 'audio' ? 'audio.mp3' : 'upload.jpg',
      });
      const response = await api.post(`/submissions/${challengeId}/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
  }
};

export const votingService = {
  castVote: async (submissionId) => {
    const response = await api.post(`/votes/${submissionId}`);
    return response.data;
  }
};

export const helpService = {
  getAllPosts: async () => {
    const response = await api.get('/help/posts');
    return response.data;
  },
  getPostById: async (id) => {
    const response = await api.get(`/help/posts/${id}`);
    return response.data;
  },
  createPost: async (postData) => {
    const response = await api.post('/help/posts', postData);
    return response.data;
  },
  replyToPost: async (postId, replyData) => {
    const response = await api.post(`/help/posts/${postId}/replies`, replyData);
    return response.data;
  },
  acceptReply: async (replyId) => {
    const response = await api.put(`/help/replies/${replyId}/accept`);
    return response.data;
  },
  deletePost: async (postId) => {
    const response = await api.post(`/help/posts/${postId}/delete`);
    return response.data;
  }
};

export const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'upload.jpg',
    });
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export const leaderboardService = {
  getGlobal: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  }
};

export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }
};

export default api;
