import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Todos from "./pages/Todos";
import TodoDetail from "./pages/TodoDetail";
import Layout from "./components/Layout";
import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/todos/:id" element={<Todos />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/todo/:id" element={<TodoDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;
