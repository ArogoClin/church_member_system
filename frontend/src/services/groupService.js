import api from './api';

export const groupService = {
  // Get all groups
  getGroups: async () => {
    const response = await api.get('/groups');
    return response.data;
  },

  // Get single group
  getGroup: async (id) => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  // Get group members
  getGroupMembers: async (id) => {
    const response = await api.get(`/groups/${id}/members`);
    return response.data;
  },

  // Create group
  createGroup: async (data) => {
    const response = await api.post('/groups', data);
    return response.data;
  },

  // Update group
  updateGroup: async (id, data) => {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  },

  // Delete group
  deleteGroup: async (id) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  }
};