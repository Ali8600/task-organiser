import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { setAuthToken } from '../api/axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/users/login', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      setAuthToken(token);
      navigate('/todos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Welcome Back</h1>
            <p className="page-subtitle">Sign in to your account to continue</p>
          </div>

          <div className="card">
            <form onSubmit={handleLogin}>
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
