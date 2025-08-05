import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || password.length < 6)
    return res.status(400).json({ error: 'Invalid email or password' });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return res.status(409).json({ error: 'Email already in use' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  res.status(201).json({ message: 'User registered' });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  res.status(200).json({ token });
};
