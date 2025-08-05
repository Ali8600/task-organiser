import { useEffect, useState } from "react";
import axios, { setAuthToken } from "../api/axios";
import { Link } from "react-router-dom";

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
  const [desc, setDesc] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);

    axios
      .get<Todo[]>("http://localhost:5001/api/todos")
      .then((res) => setTodos(res.data))
      .catch(() => alert("Failed to load todos"));
  }, []);

  const addTodo = async () => {
    try {
      const res = await axios.post<Todo>("http://localhost:5001/api/todos", {
        title,
        description: desc,
      });
      setTodos([...todos, res.data]);
      setTitle("");
      setDesc("");
    } catch {
      alert("Failed to add todo");
    }
  };

  return (
    <div>
      <h2>Your Todos</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <button onClick={addTodo}>Add Todo</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <Link to={`/todos/${todo.id}`}>{todo.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Todos;
