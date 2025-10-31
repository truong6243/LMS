import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getManagedMaterials, deleteMaterial } from "../api/materials";

const styles = {
  container: {
    maxWidth: '1200px',
  },
  header: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
  },
  table: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  thead: {
    backgroundColor: '#f8f9fa',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#555',
    borderBottom: '2px solid #e0e0e0',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '500',
  },
  status: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  statusDraft: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  statusPublished: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#999',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  error: {
    padding: '16px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '16px',
  }
};

export default function MaterialsManage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    setLoading(true);
    setError("");
    try {
      const data = await getManagedMaterials();
      setItems(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Bạn không có quyền xem danh sách học liệu được phân công.");
      } else {
        setError("Không thể tải danh sách học liệu");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Bạn có chắc muốn xóa học liệu "${title}"?`)) {
      return;
    }

    try {
      await deleteMaterial(id);
      setItems(items.filter(item => item.materialId !== id));
      alert('Đã xóa thành công!');
    } catch (err) {
      if (err.response?.status === 403) {
        alert('Bạn không có quyền xóa học liệu này');
      } else if (err.response?.status === 404) {
        alert('Học liệu không tồn tại');
      } else {
        alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
      }
    }
  }

  function getStatusText(status) {
    switch(status) {
      case 0: return 'Nháp';
      case 1: return 'Chờ duyệt';
      case 2: return 'Đang chỉnh sửa';
      case 3: return 'Đã xuất bản';
      default: return 'Không xác định';
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return <div style={styles.loading}>Đang tải danh sách học liệu...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý học liệu</h1>
        <Link to="/materials/upload" style={styles.addButton}>
          + Thêm học liệu mới
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {items.length === 0 && !error ? (
        <div style={styles.empty}>
          Bạn chưa được phân công quản lý học liệu nào
        </div>
      ) : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Tiêu đề</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Cập nhật lúc</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.materialId}>
                <td style={styles.td}>{item.materialId}</td>
                <td style={styles.td}>
                  <Link 
                    to={`/materials/view/${item.materialId}`} 
                    style={styles.link}
                  >
                    {item.title}
                  </Link>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.status,
                    ...(item.status === 3 ? styles.statusPublished : styles.statusDraft)
                  }}>
                    {getStatusText(item.status)}
                  </span>
                </td>
                <td style={styles.td}>{formatDate(item.updatedAt)}</td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(item.materialId, item.title)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
