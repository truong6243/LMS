import Sidebar from "../components/Sidebar";

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#fff',
    padding: '16px 24px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '6px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  main: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  }
};

export default function AppLayout({ user, menu, onLogout, children }) {
  const handleLogoutHover = (e, isHover) => {
    e.currentTarget.style.backgroundColor = isHover ? '#c82333' : '#dc3545';
  };

  return (
    <div style={styles.container}>
      <Sidebar menu={menu} />
      <div style={styles.content}>
        <div style={styles.header}>
          {user && (
            <div style={styles.userInfo}>
              <span style={styles.userName}>
                👤 {user.fullName}
              </span>
              <button 
                onClick={onLogout} 
                style={styles.logoutButton}
                onMouseEnter={(e) => handleLogoutHover(e, true)}
                onMouseLeave={(e) => handleLogoutHover(e, false)}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
        <div style={styles.main}>
          {children}
        </div>
      </div>
    </div>
  );
}
