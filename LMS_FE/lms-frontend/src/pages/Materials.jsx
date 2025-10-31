import { useState, useEffect } from 'react';
import { getAllMaterials, uploadMaterial, updateMaterial, deleteMaterial, submitMaterial, approveMaterial, rejectMaterial } from '../api/materials';
import api from '../api';

const STATUS_LABELS = {
  0: { label: 'Nháp', color: '#757575' },
  1: { label: 'Nháp', color: '#757575' },
  2: { label: 'Chờ duyệt', color: '#ff9800' },
  3: { label: 'Đã xuất bản', color: '#4caf50' }
};

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [userActions, setUserActions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    htmlContent: ''
  });

  // Helper function to check if user has specific action
  const hasAction = (actionCode) => {
    return userActions.includes(actionCode);
  };

  useEffect(() => {
    // Lấy actions từ API
    const loadActions = async () => {
      try {
        const res = await api.get('/menu/actions');
        setUserActions(res.data.actions || []);
      } catch (e) {
        console.error('Failed to load actions:', e);
      }
    };
    
    // Lấy current user info
    const userStr = localStorage.getItem('lms_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.userId);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    
    loadActions();
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await getAllMaterials(filterStatus);
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
      alert('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMaterial(null);
    setFormData({ title: '', htmlContent: '' });
    setShowModal(true);
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      htmlContent: material.htmlContent || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.materialId, formData);
        alert('Cập nhật tài liệu thành công');
      } else {
        await uploadMaterial(formData);
        alert('Tạo tài liệu thành công');
      }

      setShowModal(false);
      loadMaterials();
    } catch (error) {
      console.error('Failed to save material:', error);
      alert('Không thể lưu tài liệu');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      return;
    }

    try {
      await deleteMaterial(id);
      alert('Xóa tài liệu thành công');
      loadMaterials();
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Không thể xóa tài liệu');
    }
  };

  const handleSubmitForReview = async (id) => {
    if (!confirm('Gửi tài liệu để duyệt?')) {
      return;
    }

    try {
      await submitMaterial(id);
      alert('Đã gửi tài liệu để duyệt');
      loadMaterials();
    } catch (error) {
      console.error('Failed to submit material:', error);
      alert('Không thể gửi tài liệu');
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Duyệt và xuất bản tài liệu này?')) {
      return;
    }

    try {
      await approveMaterial(id);
      alert('Đã duyệt và xuất bản tài liệu');
      loadMaterials();
    } catch (error) {
      console.error('Failed to approve material:', error);
      alert('Không thể duyệt tài liệu');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Lý do từ chối:');
    if (reason === null) return;

    try {
      await rejectMaterial(id, reason);
      alert('Đã từ chối tài liệu');
      loadMaterials();
    } catch (error) {
      console.error('Failed to reject material:', error);
      alert('Không thể từ chối tài liệu');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Đang tải...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Quản lý tài liệu</h1>
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
          ➕ Thêm tài liệu
        </button>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setFilterStatus(null)}
          style={{
            padding: '8px 16px',
            backgroundColor: filterStatus === null ? '#1976d2' : '#f5f5f5',
            color: filterStatus === null ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilterStatus(0)}
          style={{
            padding: '8px 16px',
            backgroundColor: filterStatus === 0 ? '#1976d2' : '#f5f5f5',
            color: filterStatus === 0 ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Nháp
        </button>
        <button
          onClick={() => setFilterStatus(2)}
          style={{
            padding: '8px 16px',
            backgroundColor: filterStatus === 2 ? '#1976d2' : '#f5f5f5',
            color: filterStatus === 2 ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Chờ duyệt
        </button>
        <button
          onClick={() => setFilterStatus(3)}
          style={{
            padding: '8px 16px',
            backgroundColor: filterStatus === 3 ? '#1976d2' : '#f5f5f5',
            color: filterStatus === 3 ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Đã xuất bản
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Tiêu đề</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Tác giả</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Trạng thái</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Cập nhật</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', width: '300px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
                  Không có tài liệu nào
                </td>
              </tr>
            ) : (
              materials.map((material) => {
                const statusInfo = STATUS_LABELS[material.status] || { label: 'Không xác định', color: '#999' };
                return (
                <tr key={material.materialId} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>{material.title}</td>
                  <td style={{ padding: '12px' }}>{material.ownerFullName || material.ownerUsername}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: 'white',
                      backgroundColor: statusInfo.color
                    }}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(material.updatedAt).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* Nút Sửa - chỉ owner mới được sửa */}
                        {material.ownerUserId === currentUserId && material.status !== 3 && (
                          <button
                            onClick={() => handleEdit(material)}
                            style={{
                              padding: '6px 12px',
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
                        )}

                        {/* Nút Gửi duyệt - chỉ owner + status Draft */}
                        {material.ownerUserId === currentUserId && (material.status === 0 || material.status === 1) && (
                          <button
                            onClick={() => handleSubmitForReview(material.materialId)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ff9800',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            📤 Gửi duyệt
                          </button>
                        )}

                        {/* Nút Duyệt/Từ chối - chỉ reviewer có quyền + status Pending */}
                        {material.status === 2 && hasAction('MATERIAL_APPROVE') && (
                          <>
                            <button
                              onClick={() => handleApprove(material.materialId)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ✅ Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(material.materialId)}
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
                              ❌ Từ chối
                            </button>
                          </>
                        )}
                        
                        {/* Nếu KHÔNG có quyền duyệt và là owner, hiển thị thông báo */}
                        {material.status === 2 && !hasAction('MATERIAL_APPROVE') && material.ownerUserId === currentUserId && (
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#ff9800',
                            fontStyle: 'italic' 
                          }}>
                            ⏳ Đang chờ duyệt
                          </span>
                        )}

                        {/* Nút Xóa - chỉ owner mới được xóa */}
                        {material.ownerUserId === currentUserId && material.status !== 3 && (
                          <button
                            onClick={() => handleDelete(material.materialId)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#757575',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </div>

                      {/* Hiển thị lý do từ chối cho owner */}
                      {material.ownerUserId === currentUserId && material.rejectReason && material.status === 0 && (
                        <div style={{
                          width: '100%',
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: '#ffebee',
                          border: '1px solid #f44336',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textAlign: 'left'
                        }}>
                          <strong style={{ color: '#f44336' }}>❌ Đã bị từ chối:</strong>
                          <div style={{ marginTop: '4px' }}>{material.rejectReason}</div>
                          {material.reviewerFullName && (
                            <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#666' }}>
                              Người duyệt: {material.reviewerFullName}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>
              {editingMaterial ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Tiêu đề <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Nội dung
                </label>
                <textarea
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}
                  placeholder="Nhập nội dung HTML..."
                />
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
                  {editingMaterial ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
