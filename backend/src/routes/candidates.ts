import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// 1. Get All Candidates
router.get('/', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { stage, status, search } = req.query;

    const whereClause: any = {};

    if (stage) {
      whereClause.currentStage = stage as string;
    }

    if (status) {
      whereClause.status = status as string;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const candidates = await prisma.candidate.findMany({
      where: whereClause,
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        aiAnalysis: {
          select: {
            matchScore: true,
            recommendation: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(candidates);
  } catch (error: any) {
    console.error('Fetch candidates error:', error);
    res.status(500).json({ error: 'Internal server error fetching candidates' });
  }
});

// 2. Get Candidate Details by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        interviews: {
          include: {
            interviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        },
        evaluations: {
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
        },
        aiAnalysis: true,
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error: any) {
    console.error('Fetch candidate detail error:', error);
    res.status(500).json({ error: 'Internal server error fetching candidate detail' });
  }
});

// 3. Create Candidate
router.post('/', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { name, email, phone, resumeText, currentStage } = req.body;
    const recruiterId = req.user?.userId;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (!recruiterId) {
      return res.status(401).json({ error: 'Recruiter credentials not found' });
    }

    const existingCandidate = await prisma.candidate.findUnique({
      where: { email },
    });

    if (existingCandidate) {
      return res.status(400).json({ error: 'Candidate with this email already exists' });
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone,
        resumeText: resumeText || '',
        currentStage: currentStage || 'APPLIED',
        status: 'ACTIVE',
        recruiterId,
      },
    });

    res.status(201).json(candidate);
  } catch (error: any) {
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Internal server error creating candidate' });
  }
});

// 4. Update Candidate
router.put('/:id', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const { name, email, phone, resumeText, currentStage, status } = req.body;

    const existingCandidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!existingCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingCandidate.name,
        email: email !== undefined ? email : existingCandidate.email,
        phone: phone !== undefined ? phone : existingCandidate.phone,
        resumeText: resumeText !== undefined ? resumeText : existingCandidate.resumeText,
        currentStage: currentStage !== undefined ? currentStage : existingCandidate.currentStage,
        status: status !== undefined ? status : existingCandidate.status,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Internal server error updating candidate' });
  }
});

// 5. Patch Candidate Stage
router.patch('/:id/stage', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;
    const { currentStage } = req.body;

    if (!currentStage) {
      return res.status(400).json({ error: 'Current stage is required' });
    }

    const existingCandidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!existingCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    let status = existingCandidate.status;
    if (currentStage === 'HIRED') {
      status = 'HIRED';
    } else if (currentStage === 'REJECTED') {
      status = 'REJECTED';
    } else {
      status = 'ACTIVE';
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        currentStage,
        status,
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Patch candidate stage error:', error);
    res.status(500).json({ error: 'Internal server error updating candidate stage' });
  }
});

// 6. Delete Candidate
router.delete('/:id', authenticate, async (req: AuthRequest, res: any) => {
  try {
    const { id } = req.params;

    const existingCandidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!existingCandidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    await prisma.candidate.delete({
      where: { id },
    });

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error: any) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Internal server error deleting candidate' });
  }
});

export default router;
