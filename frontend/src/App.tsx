import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Todos from "./pages/Todos";
import TodoDetail from "./pages/TodoDetail";

function App() {
  return (
    <Routes>
      <Route path="/todos/:id" element={<TodoDetail />} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/todos" element={<Todos />} />
    </Routes>
  );
}

export default App;
