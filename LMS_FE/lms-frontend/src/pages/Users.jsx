import { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser, getUserRoles, assignRole, removeRole } from '../api/users';
import { getAllRoles } from '../api/roles';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    status: 1
  });

  // Load danh sách users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal để tạo user mới
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      fullName: '',
      status: 1
    });
    setShowModal(true);
  };

  // Mở modal để sửa user
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      email: user.email || '',
      fullName: user.fullName || '',
      status: user.status
    });
    setShowModal(true);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update
        await updateUser(editingUser.userId, {
          email: formData.email,
          fullName: formData.fullName,
          status: formData.status
        });
        alert('Cập nhật người dùng thành công');
      } else {
        // Create
        await createUser(formData);
        alert('Tạo người dùng thành công');
      }
      
      setShowModal(false);
      loadUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert(editingUser ? 'Không thể cập nhật người dùng' : 'Không thể tạo người dùng');
    }
  };

  // Xóa user
  const handleDelete = async (user) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.username}"?`)) {
      return;
    }

    try {
      await deleteUser(user.userId);
      alert('Xóa người dùng thành công');
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Không thể xóa người dùng');
    }
  };

  // Mở modal quản lý vai trò
  const handleManageRoles = async (user) => {
    try {
      setSelectedUser(user);
      setSelectedRoleToAdd(''); // Reset selection
      
      // Load vai trò hiện tại của user
      const currentRoles = await getUserRoles(user.userId);
      setUserRoles(currentRoles);
      
      // Load tất cả vai trò trong hệ thống
      const roles = await getAllRoles();
      setAllRoles(roles);
      
      setShowRoleModal(true);
    } catch (error) {
      console.error('Failed to load roles:', error);
      alert('Không thể tải danh sách vai trò');
    }
  };

  // Gán vai trò cho user
  const handleAssignRole = async () => {
    if (!selectedRoleToAdd) {
      alert('Vui lòng chọn vai trò');
      return;
    }

    try {
      await assignRole(selectedUser.userId, parseInt(selectedRoleToAdd));
      alert('Gán vai trò thành công');
      
      // Reset selection
      setSelectedRoleToAdd('');
      
      // Reload lại danh sách vai trò
      const currentRoles = await getUserRoles(selectedUser.userId);
      setUserRoles(currentRoles);
    } catch (error) {
      console.error('Failed to assign role:', error);
      alert('Không thể gán vai trò');
    }
  };

  // Xóa vai trò khỏi user
  const handleRemoveRole = async (roleId) => {
    if (!confirm('Bạn có chắc muốn xóa vai trò này?')) {
      return;
    }

    try {
      await removeRole(selectedUser.userId, roleId);
      alert('Xóa vai trò thành công');
      
      // Reload lại danh sách vai trò
      const currentRoles = await getUserRoles(selectedUser.userId);
      setUserRoles(currentRoles);
    } catch (error) {
      console.error('Failed to remove role:', error);
      alert('Không thể xóa vai trò');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Đang tải...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Quản lý người dùng</h1>
        <button
          onClick={handleCreate}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ➕ Thêm người dùng
        </button>
      </div>

      {/* Bảng danh sách users */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Username</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Họ tên</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Trạng thái</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Ngày tạo</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
                  Chưa có người dùng nào
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{user.userId}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{user.username}</td>
                  <td style={{ padding: '12px' }}>{user.fullName || '-'}</td>
                  <td style={{ padding: '12px' }}>{user.email || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: user.status === 1 ? '#e8f5e9' : '#ffebee',
                      color: user.status === 1 ? '#2e7d32' : '#c62828'
                    }}>
                      {user.status === 1 ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleManageRoles(user)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        backgroundColor: '#9c27b0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      👥 Vai trò
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal tạo/sửa user */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Username {!editingUser && <span style={{ color: 'red' }}>*</span>}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  required={!editingUser}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: editingUser ? '#f5f5f5' : 'white'
                  }}
                />
              </div>

              {!editingUser && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Mật khẩu <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Họ tên
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Vô hiệu hóa</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {editingUser ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal quản lý vai trò */}
      {showRoleModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              Quản lý vai trò - {selectedUser.username}
            </h2>
            
            {/* Vai trò hiện tại */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Vai trò hiện tại</h3>
              {userRoles.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Chưa có vai trò nào</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {userRoles.map((role) => (
                    <div
                      key={role.roleId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '16px',
                        fontSize: '14px'
                      }}
                    >
                      <span>{role.roleName}</span>
                      <button
                        onClick={() => handleRemoveRole(role.roleId)}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '12px',
                          lineHeight: '1'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thêm vai trò */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Thêm vai trò</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <select
                  value={selectedRoleToAdd}
                  onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">-- Chọn vai trò --</option>
                  {allRoles
                    .filter(role => !userRoles.find(ur => ur.roleId === role.roleId))
                    .map((role) => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.roleName} ({role.roleCode})
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleAssignRole}
                  disabled={!selectedRoleToAdd}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: selectedRoleToAdd ? '#4caf50' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: selectedRoleToAdd ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Thêm
                </button>
              </div>
              {allRoles.filter(role => !userRoles.find(ur => ur.roleId === role.roleId)).length === 0 && (
                <p style={{ color: '#999', fontStyle: 'italic', marginTop: '12px', marginBottom: 0 }}>Đã gán tất cả vai trò</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
