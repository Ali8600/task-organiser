import express from "express";
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticateJWT); // All routes protected

router.post("/", createTodo);
router.get("/", getTodos);
router.get("/:id", getTodoById); // Removed duplicate authenticateJWT
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
