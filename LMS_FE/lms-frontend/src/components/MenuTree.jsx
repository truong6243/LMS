import { Link } from "react-router-dom";

const styles = {
  menuItem: {
    marginBottom: '8px',
  },
  menuLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    textDecoration: 'none',
    color: '#333',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
  },
  menuLinkHover: {
    backgroundColor: '#f0f0f0',
  },
  menuGroup: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#666',
    padding: '8px 12px',
    marginBottom: '4px',
  },
  icon: {
    marginRight: '8px',
    fontSize: '16px',
  },
  children: {
    marginLeft: '20px',
    borderLeft: '2px solid #e0e0e0',
    paddingLeft: '8px',
  }
};

function MenuItem({ node }) {
  const isGroup = !node.path;
  
  const handleMouseEnter = (e) => {
    if (!isGroup) {
      e.currentTarget.style.backgroundColor = '#f0f0f0';
    }
  };
  
  const handleMouseLeave = (e) => {
    if (!isGroup) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  return (
    <div style={styles.menuItem}>
      {node.path ? (
        <Link 
          to={node.path} 
          style={styles.menuLink}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {node.icon && <span style={styles.icon}>{node.icon}</span>}
          <span>{node.actionName}</span>
        </Link>
      ) : (
        <div style={styles.menuGroup}>
          {node.icon && <span style={styles.icon}>{node.icon}</span>}
          {node.actionName}
        </div>
      )}
      {node.children && node.children.length > 0 && (
        <div style={styles.children}>
          {node.children.map((c) => (
            <MenuItem key={c.actionId} node={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuTree({ nodes }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ padding: '12px', color: '#999', fontSize: '14px' }}>
        Không có menu
      </div>
    );
  }
  
  return (
    <div>
      {nodes.map((n) => (
        <MenuItem key={n.actionId} node={n} />
      ))}
    </div>
  );
}
