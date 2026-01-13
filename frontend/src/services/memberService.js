import api from './api';

export const memberService = {
  // Get all members with filters
  getMembers: async (params = {}) => {
    const response = await api.get('/members', { params });
    return response.data;
  },

  // Get single member
  getMember: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  // Get member statistics
  getStats: async () => {
    const response = await api.get('/members/stats');
    return response.data;
  },

  // Create member
  createMember: async (data) => {
    const response = await api.post('/members', data);
    return response.data;
  },

  // Update member
  updateMember: async (id, data) => {
    const response = await api.put(`/members/${id}`, data);
    return response.data;
  },

  // Delete member
  deleteMember: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  }
};