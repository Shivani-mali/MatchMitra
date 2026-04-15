import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';
import interestsRouter from './routes/interests.js';
import chatRouter from './routes/chat.js';
import reportsRouter from './routes/reports.js';
import { verifyFirebaseToken } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('MatchMitra backend is running');
});

app.use('/api/users', verifyFirebaseToken, usersRouter);
app.use('/api/interests', verifyFirebaseToken, interestsRouter);
app.use('/api/chat', verifyFirebaseToken, chatRouter);
app.use('/api/reports', verifyFirebaseToken, reportsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
