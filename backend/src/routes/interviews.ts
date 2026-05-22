import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// 1. Get All Interviewers/Users
router.get('/interviewers', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const interviewers = await prisma.user.findMany({
      where: {
        role: { in: ['INTERVIEWER', 'RECRUITER'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    res.json(interviewers);
  } catch (error: any) {
    console.error('Fetch interviewers error:', error);
    res.status(500).json({ error: 'Internal server error fetching interviewers' });
  }
});

// 2. Get All Interviews
router.get('/', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            currentStage: true,
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    res.json(interviews);
  } catch (error: any) {
    console.error('Fetch interviews error:', error);
    res.status(500).json({ error: 'Internal server error fetching interviews' });
  }
});

// 3. Schedule Interview
router.post('/', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { candidateId, title, scheduledAt, interviewerId } = req.body;

    if (!candidateId || !title || !scheduledAt || !interviewerId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const interviewer = await prisma.user.findUnique({
      where: { id: interviewerId },
    });

    if (!interviewer) {
      return res.status(404).json({ error: 'Interviewer not found' });
    }

    const interview = await prisma.interview.create({
      data: {
        candidateId,
        title,
        scheduledAt: new Date(scheduledAt),
        interviewerId,
        status: 'SCHEDULED',
      },
      include: {
        candidate: true,
        interviewer: true,
      },
    });

    res.status(201).json(interview);
  } catch (error: any) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ error: 'Internal server error scheduling interview' });
  }
});

// 4. Update Interview Feedback / Status
router.put('/:id', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const { feedback, rating, status } = req.body;

    const existingInterview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!existingInterview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        feedback: feedback !== undefined ? feedback : existingInterview.feedback,
        rating: rating !== undefined ? parseInt(rating) : existingInterview.rating,
        status: status !== undefined ? status : existingInterview.status,
      },
      include: {
        candidate: true,
        interviewer: true,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Update interview error:', error);
    res.status(500).json({ error: 'Internal server error updating interview' });
  }
});

export default router;
