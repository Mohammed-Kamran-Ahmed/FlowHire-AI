import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

import authRoutes from './routes/auth';
import candidateRoutes from './routes/candidates';
import interviewRoutes from './routes/interviews';
import evaluationRoutes from './routes/evaluations';
import aiRoutes from './routes/ai';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FlowHire AI API is running' });
});

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL (Supabase) connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 FlowHire Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
}

main();
