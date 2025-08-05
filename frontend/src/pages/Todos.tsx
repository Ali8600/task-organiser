import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { setAuthToken } from "../api/axios";
import Layout from "../components/Layout";

interface Todo {
  id: number;
  title: string;
  description: string;
  isCompleted?: boolean;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    setAuthToken(token);
    loadTodos();
  }, [navigate]);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get<Todo[]>("http://localhost:5001/api/todos");
      setTodos(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to load todos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    try {
      const res = await axios.post<Todo>("http://localhost:5001/api/todos", {
        title: title.trim(),
        description: description.trim(),
      });
      setTodos([res.data, ...todos]);
      setTitle("");
      setDescription("");
    } catch (err: any) {
      setError("Failed to add todo");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = async (id: number, isCompleted: boolean) => {
    try {
      await axios.put(`http://localhost:5001/api/todos/${id}`, {
        isCompleted: !isCompleted,
      });
      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, isCompleted: !isCompleted }
          : todo
      ));
    } catch (err: any) {
      setError("Failed to update todo");
    }
  };

  const deleteTodo = async (id: number) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;
    
    try {
      await axios.delete(`http://localhost:5001/api/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err: any) {
      setError("Failed to delete todo");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout showNav={true}>
      <div className="dashboard-container">
        <div className="container">
          {error && (
            <div className="alert alert-error">
              {error}
              <button 
                onClick={() => setError("")}
                style={{ float: 'right', background: 'none', border: 'none', color: 'inherit' }}
              >
                ×
              </button>
            </div>
          )}

          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">My Todos</h1>
              <p className="text-muted">
                {todos.length === 0 
                  ? "No todos yet" 
                  : `${todos.filter(t => !t.isCompleted).length} pending, ${todos.filter(t => t.isCompleted).length} completed`
                }
              </p>
            </div>
          </div>

          {/* Add Todo Form */}
          <div className="add-todo-card">
            <h3 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
              ✨ Add New Todo
            </h3>
            <form onSubmit={addTodo} className="add-todo-form">
              <div className="form-group mb-3">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isAdding}
                />
              </div>
              <div className="form-row">
                <textarea
                  placeholder="Add a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={isAdding}
                />
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isAdding || !title.trim()}
                >
                  {isAdding ? (
                    <>
                      <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                      Adding...
                    </>
                  ) : (
                    '+ Add Todo'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && todos.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">No todos yet</h3>
              <p className="empty-state-description">
                Create your first todo above to get started!
              </p>
            </div>
          )}

          {/* Todo Grid */}
          {!isLoading && todos.length > 0 && (
            <div className="todo-grid">
              {todos.map((todo) => (
                <div key={todo.id} className="todo-card">
                  <div className="todo-card-header">
                    <h3 className="todo-title">{todo.title}</h3>
                    <span className={`todo-status ${todo.isCompleted ? 'completed' : 'pending'}`}>
                      {todo.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  
                  {todo.description && (
                    <p className="todo-description">{todo.description}</p>
                  )}
                  
                  <div className="todo-meta">
                    <span>Created {formatDate(todo.createdAt)}</span>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                      <button
                        onClick={() => toggleTodo(todo.id, todo.isCompleted || false)}
                        className={todo.isCompleted ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
                      >
                        {todo.isCompleted ? '↶ Undo' : '✓ Complete'}
                      </button>
                      <Link 
                        to={`/todo/${todo.id}`} 
                        className="btn-secondary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="btn-danger btn-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Todos;
