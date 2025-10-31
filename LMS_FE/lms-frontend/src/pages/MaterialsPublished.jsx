import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPublishedMaterials } from "../api/materials";

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
  searchBox: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '300px',
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
  statusPublished: {
    backgroundColor: '#d4edda',
    color: '#155724',
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
  },
  pagination: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  }
};

export default function MaterialsPublished() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(0);
  const take = 20;

  useEffect(() => {
    loadMaterials();
  }, [skip]);

  async function loadMaterials() {
    setLoading(true);
    setError("");
    try {
      const data = await getPublishedMaterials(skip, take);
      setMaterials(data);
    } catch (err) {
      setError("Không thể tải danh sách học liệu");
      console.error(err);
    } finally {
      setLoading(false);
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

  function handlePrevious() {
    if (skip > 0) {
      setSkip(skip - take);
    }
  }

  function handleNext() {
    if (materials.length === take) {
      setSkip(skip + take);
    }
  }

  if (loading) {
    return <div style={styles.loading}>Đang tải danh sách học liệu...</div>;
  }

  if (error) {
    return <div style={styles.empty}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Học liệu đã xuất bản</h1>
      </div>

      {materials.length === 0 ? (
        <div style={styles.empty}>Chưa có học liệu nào được xuất bản</div>
      ) : (
        <>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Tiêu đề</th>
                <th style={styles.th}>Slug</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Cập nhật lúc</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.materialId}>
                  <td style={styles.td}>{material.materialId}</td>
                  <td style={styles.td}>
                    <Link 
                      to={`/materials/view/${material.materialId}`} 
                      style={styles.link}
                    >
                      {material.title}
                    </Link>
                  </td>
                  <td style={styles.td}>{material.slug || '-'}</td>
                  <td style={styles.td}>
                    <span style={{...styles.status, ...styles.statusPublished}}>
                      Đã xuất bản
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(material.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.pagination}>
            <button 
              style={{...styles.button, ...(skip === 0 ? styles.buttonDisabled : {})}}
              onClick={handlePrevious}
              disabled={skip === 0}
            >
              ← Trang trước
            </button>
            <button 
              style={{...styles.button, ...(materials.length < take ? styles.buttonDisabled : {})}}
              onClick={handleNext}
              disabled={materials.length < take}
            >
              Trang sau →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
