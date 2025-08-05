import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

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
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

export const getTodos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

export const updateTodo = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, isCompleted } = req.body;

  try {
    const existing = await prisma.todo.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });

    const updated = await prisma.todo.update({
      where: { id },
      data: { title, description, isCompleted },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await prisma.todo.findUnique({ where: { id } });

    if (!existing || existing.userId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });

    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};
