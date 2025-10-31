import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadMaterial } from "../api/materials";

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px',
  },
  required: {
    color: '#dc3545',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    transition: 'border-color 0.2s',
  },
  hint: {
    marginTop: '6px',
    fontSize: '13px',
    color: '#666',
  },
  button: {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  message: {
    marginTop: '24px',
    padding: '12px 16px',
    borderRadius: '4px',
    fontSize: '14px',
  },
  messageSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  messageError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  }
};

export default function MaterialsUpload() {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    
    if (!title.trim()) {
      setMessage("Vui lòng nhập tiêu đề");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const result = await uploadMaterial({
        title: title.trim(),
        fileName: fileUrl ? fileUrl.split("/").pop() : null,
        fileUrl: fileUrl.trim() || null
      });
      
      setMessage(`Upload thành công! Material ID: ${result.materialId}`);
      setMessageType("success");
      
      // Reset form sau 2 giây và chuyển trang
      setTimeout(() => {
        navigate("/materials/manage");
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setMessage("Bạn không có quyền upload học liệu");
      } else if (err.response?.status === 401) {
        setMessage("Vui lòng đăng nhập lại");
      } else {
        setMessage("Upload thất bại: " + (err.response?.data?.message || err.message));
      }
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Upload học liệu</h1>
        <p style={styles.subtitle}>
          Tạo học liệu mới trong hệ thống
        </p>
      </div>

      <form onSubmit={submit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Tiêu đề <span style={styles.required}>*</span>
          </label>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Nhập tiêu đề học liệu"
            style={styles.input}
            disabled={loading}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Đường dẫn file (tùy chọn)
          </label>
          <input 
            value={fileUrl} 
            onChange={(e) => setFileUrl(e.target.value)} 
            placeholder="VD: /uploads/material.docx hoặc https://..."
            style={styles.input}
            disabled={loading}
          />
          <div style={styles.hint}>
            ⚠️ Tính năng upload file thật sẽ được thêm sau. Hiện tại chỉ lưu đường dẫn file.
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {})
          }}
        >
          {loading ? "Đang xử lý..." : "Tải lên"}
        </button>
      </form>
      
      {message && (
        <div style={{
          ...styles.message,
          ...(messageType === 'success' ? styles.messageSuccess : styles.messageError)
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
