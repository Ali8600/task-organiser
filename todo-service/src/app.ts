import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import todoRoutes from './routes/todoRoutes';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // Only allow frontend
app.use(express.json());
app.use('/api/todos', todoRoutes);

export default app;
