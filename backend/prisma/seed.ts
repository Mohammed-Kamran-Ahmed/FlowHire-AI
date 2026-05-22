import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.aiAnalysis.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@flowhire.ai',
      passwordHash,
      role: 'RECRUITER',
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: 'Alex Mercer',
      email: 'alex@flowhire.ai',
      passwordHash,
      role: 'RECRUITER',
    },
  });

  const dave = await prisma.user.create({
    data: {
      name: 'Dave Chen',
      email: 'dave@flowhire.ai',
      passwordHash,
      role: 'INTERVIEWER',
    },
  });

  console.log('✅ Users seeded');

  // 2. Create Candidates
  const c1 = await prisma.candidate.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      phone: '+1 555-0199',
      currentStage: 'APPLIED',
      status: 'ACTIVE',
      recruiterId: sarah.id,
      resumeText: 'Full Stack Engineer with 4 years of experience building React and Node.js applications. Strong knowledge of TypeScript, REST APIs, and PostgreSQL. Passionate about automated testing and user-centric UI design.',
    },
  });

  const c2 = await prisma.candidate.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@yahoo.com',
      phone: '+1 555-0182',
      currentStage: 'SCREENING',
      status: 'ACTIVE',
      recruiterId: sarah.id,
      resumeText: 'Frontend Developer specializing in responsive interfaces, Tailwind CSS, and UX design. 3 years experience. Fluent in HTML/CSS, React, and Figma prototype translation.',
    },
  });

  const c3 = await prisma.candidate.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice.johnson@outlook.com',
      phone: '+1 555-0175',
      currentStage: 'TECH_INTERVIEW',
      status: 'ACTIVE',
      recruiterId: alex.id,
      resumeText: 'Senior Software Engineer with 8 years of React/TypeScript experience. Expertise in state management (Redux, Zustand), build tools (Vite, Webpack), and web performance optimization. Led team of 5 developers.',
    },
  });

  const c4 = await prisma.candidate.create({
    data: {
      name: 'Bob Miller',
      email: 'bob.miller@techcorp.com',
      phone: '+1 555-0164',
      currentStage: 'MGMT_INTERVIEW',
      status: 'ACTIVE',
      recruiterId: alex.id,
      resumeText: 'Technical Lead & Architect. Developed scalable distributed backends in Node.js, Go, and Python. Cloud infrastructure experience on AWS and GCP. Strong system design and leadership background.',
    },
  });

  const c5 = await prisma.candidate.create({
    data: {
      name: 'Emily Watson',
      email: 'emily.w@designhub.io',
      phone: '+1 555-0153',
      currentStage: 'HIRED',
      status: 'HIRED',
      recruiterId: sarah.id,
      resumeText: 'UI/UX Developer with deep React experience. Bridging design and frontend code. High proficiency in micro-interactions, CSS animations, and visual storytelling.',
    },
  });

  const c6 = await prisma.candidate.create({
    data: {
      name: 'Frank White',
      email: 'frank.white@gmail.com',
      phone: '+1 555-0142',
      currentStage: 'REJECTED',
      status: 'REJECTED',
      recruiterId: alex.id,
      resumeText: 'Junior Developer seeking entry role. Basic JavaScript, HTML, and CSS skills. No React experience, but eager to learn.',
    },
  });

  console.log('✅ Candidates seeded');

  // 3. Create Interviews
  // Alice Tech Interview
  const int1 = await prisma.interview.create({
    data: {
      candidateId: c3.id,
      title: 'Technical Deep-Dive',
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      status: 'COMPLETED',
      interviewerId: dave.id,
      feedback: 'Alice has exceptional depth in React. She explained the fiber tree and concurrent rendering very clearly. Understood typescript generics and state machine patterns perfectly. Strong problem solving.',
      rating: 5,
    },
  });

  // Bob Manager Interview
  const int2 = await prisma.interview.create({
    data: {
      candidateId: c4.id,
      title: 'System Design & Leadership',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      status: 'SCHEDULED',
      interviewerId: dave.id,
    },
  });

  console.log('✅ Interviews seeded');

  // 4. Create Evaluations
  const eval1 = await prisma.evaluation.create({
    data: {
      candidateId: c3.id,
      userId: dave.id,
      technicalScore: 5,
      communicationScore: 4,
      cultureScore: 4,
      recommendation: 'STRONG_HIRE',
      comments: 'An absolute slam dunk on the technical assessment. Alice was collaborative, communicated her logic, and followed clean code standards. High recommendation.',
    },
  });

  console.log('✅ Evaluations seeded');

  // 5. Create AI Analysis (Mocked initial, which can be updated by Gemini API)
  await prisma.aiAnalysis.create({
    data: {
      candidateId: c3.id,
      summary: 'Alice Johnson is a highly competent Senior Frontend Developer with 8 years of specialized React experience. She performed exceptionally well in the Technical Deep-Dive assessment, demonstrating advanced system design capability.',
      strengths: JSON.stringify(['Expert React & TypeScript knowledge', 'Experience leading developers', 'Excellent communication skills']),
      weaknesses: JSON.stringify(['Limited recent backend development exposure']),
      recommendation: 'STRONG_RECOMMEND',
      matchScore: 92,
    },
  });

  console.log('✅ AI Analyses seeded');
  console.log('🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
