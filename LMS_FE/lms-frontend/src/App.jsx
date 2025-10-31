import { BrowserRouter } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useMenu } from "./hooks/useMenu";
import AppRoutes from "./routes";

export default function App() {
  const { user, error, loading, doLogin, doLogout } = useAuth();
  const { menu } = useMenu(!!user);

  // Show loading while validating token
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes 
        user={user} 
        error={error} 
        menu={menu} 
        doLogin={doLogin} 
        doLogout={doLogout} 
      />
    </BrowserRouter>
  );
}
