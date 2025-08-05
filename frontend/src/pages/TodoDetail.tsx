import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import todoApi, { setTodoAuthToken } from '../api/todoApi';
import Layout from '../components/Layout';

interface Todo {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const TodoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todo, setTodo] = useState<Todo>({ 
    id: 0,
    title: '', 
    description: '', 
    isCompleted: false 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    setTodoAuthToken(token);
    loadTodo();
  }, [id, navigate]);

  const loadTodo = async () => {
    try {
      setIsLoading(true);
      const res = await todoApi.get(`/todos/${id}`);
      setTodo(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Todo not found");
      } else {
        setError("Failed to load todo");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTodo(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodo(prev => ({ ...prev, isCompleted: e.target.checked }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo.title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      await todoApi.put(`/todos/${id}`, {
        title: todo.title.trim(),
        description: todo.description.trim(),
        isCompleted: todo.isCompleted
      });
      setHasChanges(false);
      navigate('/todos');
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update todo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this todo?")) return;
    
    setIsSaving(true);
    try {
      await todoApi.delete(`/todos/${id}`);
      navigate('/todos');
    } catch (err: any) {
      setError("Failed to delete todo");
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Layout showNav={true}>
        <div className="page-container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !todo.id) {
    return (
      <Layout showNav={true}>
        <div className="page-container">
          <div className="container">
            <div className="page-content">
              <div className="card">
                <div className="alert alert-error">
                  {error}
                </div>
                <button 
                  onClick={() => navigate('/todos')}
                  className="btn-primary"
                >
                  ← Back to Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNav={true}>
      <div className="page-container">
        <div className="container">
          <div className="page-content" style={{ maxWidth: '600px' }}>
            <div className="page-header">
              <h1 className="page-title">Edit Todo</h1>
              <p className="page-subtitle">Make changes to your todo item</p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Title *
                  </label>
                  <input 
                    id="title"
                    name="title" 
                    value={todo.title} 
                    onChange={handleChange} 
                    placeholder="Enter todo title"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea 
                    id="description"
                    name="description" 
                    value={todo.description} 
                    onChange={handleChange} 
                    placeholder="Enter todo description (optional)"
                    rows={4}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <input 
                      type="checkbox" 
                      checked={todo.isCompleted} 
                      onChange={handleCheckbox}
                      disabled={isSaving}
                      style={{ width: 'auto' }}
                    />
                    Mark as completed
                  </label>
                </div>

                {/* Meta Information */}
                {(todo.createdAt || todo.updatedAt) && (
                  <div style={{ 
                    padding: 'var(--spacing-md)', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderRadius: '8px',
                    marginBottom: 'var(--spacing-lg)',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)'
                  }}>
                    {todo.createdAt && (
                      <div>Created: {formatDate(todo.createdAt)}</div>
                    )}
                    {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
                      <div>Last updated: {formatDate(todo.updatedAt)}</div>
                    )}
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-md)', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    type="button"
                    onClick={() => navigate('/todos')}
                    className="btn-secondary"
                    disabled={isSaving}
                  >
                    ← Back to Todos
                  </button>
                  
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button 
                      type="button"
                      onClick={handleDelete}
                      className="btn-danger"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                    
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={isSaving || !hasChanges}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                          Saving...
                        </>
                      ) : (
                        '💾 Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TodoDetail;
