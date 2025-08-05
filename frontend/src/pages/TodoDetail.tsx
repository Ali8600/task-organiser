import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import todoApi, { setTodoAuthToken } from '../api/todoApi';

const TodoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todo, setTodo] = useState({ title: '', description: '', isCompleted: false });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setTodoAuthToken(token); 

    todoApi.get(`/todos/${id}`)
      .then((res) => setTodo(res.data))
      .catch((err) => console.error("Failed to fetch todo:", err));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTodo({ ...todo, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodo({ ...todo, isCompleted: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await todoApi.put(`/todos/${id}`, todo);
    navigate('/todos');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Todo</h2>
      <input name="title" value={todo.title} onChange={handleChange} placeholder="Title" />
      <textarea name="description" value={todo.description} onChange={handleChange} placeholder="Description" />
      <label>
        <input type="checkbox" checked={todo.isCompleted} onChange={handleCheckbox} />
        Completed
      </label>
      <button type="submit">Update</button>
    </form>
  );
};

export default TodoDetail;
