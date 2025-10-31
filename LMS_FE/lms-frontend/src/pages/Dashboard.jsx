const styles = {
  container: {
    maxWidth: '1200px',
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
    fontSize: '16px',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
    color: '#555',
  }
};

export default function Dashboard() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Chào mừng bạn đến với hệ thống quản lý học liệu</p>
      </div>
      
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📚 Học liệu mới nhất</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>Tài liệu React.js cơ bản</li>
            <li style={styles.listItem}>Hướng dẫn SQL Server</li>
            <li style={styles.listItem}>ASP.NET Web API Guide</li>
          </ul>
        </div>
        
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔔 Thông báo hệ thống</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>Hệ thống hoạt động bình thường</li>
            <li style={styles.listItem}>Menu được load theo quyền</li>
            <li style={styles.listItem}>Tự động gia hạn token</li>
          </ul>
        </div>
        
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔐 Menu theo quyền</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>Menu hiển thị động từ database</li>
            <li style={styles.listItem}>Phân quyền theo Role và Action</li>
            <li style={styles.listItem}>Hỗ trợ menu đa cấp</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
