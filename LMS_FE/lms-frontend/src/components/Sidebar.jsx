import MenuTree from "./MenuTree";

const styles = {
  sidebar: {
    width: '260px',
    borderRight: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  header: {
    padding: '20px 16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#999',
  },
  menuContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 12px',
  }
};

export default function Sidebar({ menu }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h1 style={styles.title}>LMS System</h1>
        <p style={styles.subtitle}>Learning Management</p>
      </div>
      <div style={styles.menuContainer}>
        <MenuTree nodes={menu} />
      </div>
    </div>
  );
}
