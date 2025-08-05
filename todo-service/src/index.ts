import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import todoRoutes from './routes/todoRoutes';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // Only allow frontend
//  app.use(cors()); // ahh...this would allow all origins, which is not secure, so I might not

app.use(express.json());
app.use('/api/todos', todoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Todo Service running on port ${PORT}`);
});
