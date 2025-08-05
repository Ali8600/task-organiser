import { Request, Response } from "express";
import prisma from "../prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const createTodo = async (req: AuthenticatedRequest, res: Response) => {
  const { title, description } = req.body;

  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        userId: req.userId!,
      },
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
};

export const getTodos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

//get a single todo by id
export const getTodoById = async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  try {
    const todo = await prisma.todo.findUnique({ where: { id } });

    if (!todo || todo.userId !== req.userId)
      return res.status(403).json({ error: "Unauthorized or Not Found" });

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todo" });
  }
};

export const updateTodo = async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { title, description, isCompleted } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  try {
    const existing = await prisma.todo.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.userId)
      return res.status(403).json({ error: "Unauthorized" });

    const updated = await prisma.todo.update({
      where: { id },
      data: { title, description, isCompleted },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo" });
  }
};

export const deleteTodo = async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  try {
    const existing = await prisma.todo.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.userId)
      return res.status(403).json({ error: "Unauthorized" });

    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
};
