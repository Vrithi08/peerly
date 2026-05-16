import { Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080/api' 
  : 'http://192.168.1.6:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased global timeout to 60s
  headers: {
    // We remove the global Content-Type to allow multipart/form-data to be auto-detected
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
    const response = await api.post('/auth/login', { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData, {
      headers: { 'Content-Type': 'application/json' }
    });
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
  getTrending: async () => {
    const response = await api.get('/challenges/trending');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },
  create: async (challengeData) => {
    const response = await api.post('/challenges', challengeData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
};

export const submissionService = {
  getByChallengeId: async (challengeId) => {
    const response = await api.get(`/submissions/${challengeId}`);
    return response.data;
  },
  getMySubmission: async (challengeId) => {
    const response = await api.get(`/submissions/${challengeId}/my`);
    return response.data;
  },
  create: async (challengeId, data) => {
    if (data.type === 'text') {
      const response = await api.post(`/submissions/${challengeId}/text`, null, {
        params: { content: data.content },
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } else {
      const getMimeType = (type) => {
        switch(type) {
          case 'audio': return 'audio/mpeg';
          case 'video': return 'video/mp4';
          case 'image': return 'image/jpeg';
          default: return 'application/pdf';
        }
      };
      const getFileName = (type) => {
        switch(type) {
          case 'audio': return 'audio.mp3';
          case 'video': return 'video.mp4';
          case 'image': return 'upload.jpg';
          default: return 'document.pdf';
        }
      };

      const formData = new FormData();
      const uri = data.attachmentUri;
      
      // Extract filename and extension from URI
      const uriParts = uri.split('/');
      const uriName = uriParts[uriParts.length - 1];
      const uriType = uriName.split('.').pop();
      
      const filePayload = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: data.mimeType || 'video/mp4',
        name: data.fileName || uriName || 'submission.mp4',
      };

      console.log('--- Submission Payload ---');
      console.log('Target URL:', `/submissions/${challengeId}/file`);
      console.log('File Payload:', filePayload);

      formData.append('file', filePayload);

      const response = await api.post(`/submissions/${challengeId}/file`, formData, {
        headers: { 
          'Accept': 'application/json'
        },
        timeout: 300000 // 5 minutes for video
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
    const response = await api.post('/help/posts', postData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
  replyToPost: async (postId, replyData) => {
    const response = await api.post(`/help/posts/${postId}/replies`, replyData, {
      headers: { 'Content-Type': 'application/json' }
    });
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
    
    const uriParts = file.uri.split('/');
    const uriName = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: file.uri,
      type: file.type || file.mimeType || 'image/jpeg',
      name: file.fileName || uriName || 'upload.jpg',
    });

    const response = await api.post('/upload', formData, {
      timeout: 120000 // 2 minutes for file uploads
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

export const platformStatsService = {
  getStats: async () => {
    const response = await api.get('/stats/platform');
    return response.data;
  }
};

export default api;
