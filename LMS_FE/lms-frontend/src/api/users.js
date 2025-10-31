import api from './index';

// Lấy danh sách tất cả người dùng
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data.data;
};

// Lấy thông tin một người dùng
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

// Tạo người dùng mới
export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Cập nhật người dùng
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Xóa người dùng
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Lấy danh sách vai trò của user
export const getUserRoles = async (id) => {
  const response = await api.get(`/users/${id}/roles`);
  return response.data.data;
};

// Gán vai trò cho user
export const assignRole = async (userId, roleId) => {
  const response = await api.post(`/users/${userId}/roles`, { roleId });
  return response.data;
};

// Xóa vai trò của user
export const removeRole = async (userId, roleId) => {
  const response = await api.delete(`/users/${userId}/roles/${roleId}`);
  return response.data;
};
