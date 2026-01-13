import api from './api';

export const jumuiaService = {
  // Get all jumuias
  getJumuias: async () => {
    const response = await api.get('/jumuias');
    return response.data;
  },

  // Get single jumuia
  getJumuia: async (id) => {
    const response = await api.get(`/jumuias/${id}`);
    return response.data;
  },

  // Get jumuia members
  getJumuiaMembers: async (id) => {
    const response = await api.get(`/jumuias/${id}/members`);
    return response.data;
  },

  // Create jumuia
  createJumuia: async (data) => {
    const response = await api.post('/jumuias', data);
    return response.data;
  },

  // Update jumuia
  updateJumuia: async (id, data) => {
    const response = await api.put(`/jumuias/${id}`, data);
    return response.data;
  },

  // Delete jumuia
  deleteJumuia: async (id) => {
    const response = await api.delete(`/jumuias/${id}`);
    return response.data;
  }
};