import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const Layout = ({ children, showNav = false }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app">
      {showNav && isAuthenticated && (
        <nav className="navbar">
          <div className="container">
            <div className="navbar-content">
              <Link to="/todos" className="navbar-brand">
                📝 TodoApp
              </Link>
              <div className="navbar-nav">
                <Link 
                  to="/todos" 
                  className={`nav-link ${location.pathname === '/todos' ? 'active' : ''}`}
                >
                  My Todos
                </Link>
                <button 
                  onClick={handleLogout}
                  className="btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      {children}
    </div>
  );
};

export default Layout;
