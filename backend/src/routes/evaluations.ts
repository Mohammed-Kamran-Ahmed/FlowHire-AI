import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// 1. Get Evaluations for Candidate
router.get('/candidate/:candidateId', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { candidateId } = req.params;
    const evaluations = await prisma.evaluation.findMany({
      where: { candidateId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(evaluations);
  } catch (error: any) {
    console.error('Fetch evaluations error:', error);
    res.status(500).json({ error: 'Internal server error fetching evaluations' });
  }
});

// 2. Add Evaluation Scorecard
router.post('/', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { candidateId, technicalScore, communicationScore, cultureScore, recommendation, comments } = req.body;
    const userId = req.user?.userId;

    if (!candidateId || !technicalScore || !communicationScore || !cultureScore || !recommendation || !comments || !userId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        candidateId,
        userId,
        technicalScore: parseInt(technicalScore),
        communicationScore: parseInt(communicationScore),
        cultureScore: parseInt(cultureScore),
        recommendation,
        comments,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(evaluation);
  } catch (error: any) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ error: 'Internal server error creating evaluation' });
  }
});

export default router;
