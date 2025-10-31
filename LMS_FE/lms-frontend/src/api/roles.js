import api from './index';

// Lấy danh sách tất cả vai trò
export const getAllRoles = async () => {
  const response = await api.get('/roles');
  return response.data.data;
};
