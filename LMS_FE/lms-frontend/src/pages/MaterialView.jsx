import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMaterialById } from "../api/materials";

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#666',
  },
  error: {
    padding: '16px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
  },
  header: {
    marginBottom: '24px',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '16px',
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '14px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  meta: {
    display: 'flex',
    gap: '24px',
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  status: {
    display: 'inline-block',
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
  content: {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginTop: '24px',
  },
  contentTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#333',
  },
  htmlContent: {
    lineHeight: '1.8',
    color: '#444',
  },
  emptyContent: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  fileInfo: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  fileInfoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#555',
  },
  fileInfoItem: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '4px',
  }
};

export default function MaterialView() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMaterial();
  }, [id]);

  async function loadMaterial() {
    setLoading(true);
    setError("");
    try {
      const data = await getMaterialById(id);
      setMaterial(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Học liệu không tồn tại");
      } else {
        setError("Không thể tải học liệu");
      }
      console.error(err);
    } finally {
      setLoading(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return <div style={styles.loading}>Đang tải học liệu...</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <Link to="/materials/published" style={styles.backLink}>
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!material) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/materials/published" style={styles.backLink}>
          ← Quay lại danh sách
        </Link>
        
        <h1 style={styles.title}>{material.title}</h1>
        
        <div style={styles.meta}>
          <div style={styles.metaItem}>
            <span>📅</span>
            <span>Cập nhật: {formatDate(material.updatedAt)}</span>
          </div>
          <div style={styles.metaItem}>
            <span>👤</span>
            <span>Owner ID: {material.ownerUserId}</span>
          </div>
          <div style={styles.metaItem}>
            <span style={{
              ...styles.status,
              ...(material.status === 3 ? styles.statusPublished : styles.statusDraft)
            }}>
              {getStatusText(material.status)}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.contentTitle}>Nội dung</h2>
        
        {material.htmlContent ? (
          <div 
            style={styles.htmlContent}
            dangerouslySetInnerHTML={{ __html: material.htmlContent }}
          />
        ) : (
          <div style={styles.emptyContent}>
            Học liệu chưa có nội dung HTML. 
            <br />
            Cần chuyển đổi từ file nguồn để hiển thị nội dung.
          </div>
        )}

        {material.sourceFilePath && (
          <div style={styles.fileInfo}>
            <div style={styles.fileInfoTitle}>📎 Thông tin file nguồn</div>
            <div style={styles.fileInfoItem}>
              <strong>Đường dẫn:</strong> {material.sourceFilePath}
            </div>
            {material.sourceFileType && (
              <div style={styles.fileInfoItem}>
                <strong>Loại file:</strong> {material.sourceFileType}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
