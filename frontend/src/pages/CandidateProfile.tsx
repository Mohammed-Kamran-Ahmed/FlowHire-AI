import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, Calendar, FileText, Star, 
  MessageSquare, User, Brain, AlertCircle, 
  Plus, CheckCircle2, ChevronRight, Loader2, Sparkles, Send, ShieldAlert
} from 'lucide-react';

interface Interview {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  interviewer: {
    id: string;
    name: string;
    email: string;
  };
  feedback: string | null;
  rating: number | null;
}

interface Evaluation {
  id: string;
  technicalScore: number;
  communicationScore: number;
  cultureScore: number;
  recommendation: string;
  comments: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeText: string | null;
  currentStage: string;
  status: string;
  recruiter: {
    name: string;
  };
  interviews: Interview[];
  evaluations: Evaluation[];
  aiAnalysis: {
    summary: string;
    strengths: string; // JSON string in DB
    weaknesses: string; // JSON string in DB
    recommendation: string;
    matchScore: number;
  } | null;
}

interface Interviewer {
  id: string;
  name: string;
  role: string;
}

export const CandidateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interview Schedule state
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [intTitle, setIntTitle] = useState('');
  const [intDate, setIntDate] = useState('');
  const [intInterviewerId, setIntInterviewerId] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Scorecard Evaluation state
  const [techScore, setTechScore] = useState(3);
  const [commScore, setCommScore] = useState(3);
  const [cultScore, setCultScore] = useState(3);
  const [evalRec, setEvalRec] = useState('HIRE');
  const [evalComments, setEvalComments] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // AI Run state
  const [analyzing, setAnalyzing] = useState(false);

  const fetchCandidateData = async () => {
    try {
      const response = await api.get(`/candidates/${id}`);
      setCandidate(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const response = await api.get('/interviews/interviewers');
      setInterviewers(response.data);
      if (response.data.length > 0) {
        setIntInterviewerId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching interviewers:', err);
    }
  };

  useEffect(() => {
    fetchCandidateData();
    fetchInterviewers();
  }, [id]);

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intTitle || !intDate || !intInterviewerId) return;

    setScheduling(true);
    try {
      await api.post('/interviews', {
        candidateId: id,
        title: intTitle,
        scheduledAt: intDate,
        interviewerId: intInterviewerId,
      });
      setIntTitle('');
      setIntDate('');
      fetchCandidateData();
    } catch (err) {
      console.error('Error scheduling interview:', err);
    } finally {
      setScheduling(false);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalComments) return;

    setSubmittingEval(true);
    try {
      await api.post('/evaluations', {
        candidateId: id,
        technicalScore: techScore,
        communicationScore: commScore,
        cultureScore: cultScore,
        recommendation: evalRec,
        comments: evalComments,
      });
      setEvalComments('');
      setTechScore(3);
      setCommScore(3);
      setCultScore(3);
      setEvalRec('HIRE');
      fetchCandidateData();
    } catch (err) {
      console.error('Error submitting evaluation:', err);
    } finally {
      setSubmittingEval(false);
    }
  };

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      await api.post(`/ai/analyze/${id}`);
      await fetchCandidateData();
    } catch (err) {
      console.error('Error running AI analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="pl-64 min-h-screen bg-background flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-text-secondary text-sm">Loading candidate dossier...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="pl-64 min-h-screen bg-background p-8 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-bold text-red-400">{error || 'Candidate not found'}</p>
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Parse AI JSON fields
  let aiStrengths: string[] = [];
  let aiWeaknesses: string[] = [];
  if (candidate.aiAnalysis) {
    try {
      aiStrengths = JSON.parse(candidate.aiAnalysis.strengths);
      aiWeaknesses = JSON.parse(candidate.aiAnalysis.weaknesses);
    } catch (e) {
      // In case they aren't encoded as JSON array strings
      aiStrengths = [candidate.aiAnalysis.strengths];
      aiWeaknesses = [candidate.aiAnalysis.weaknesses];
    }
  }

  return (
    <div className="pl-64 min-h-screen bg-background text-text-primary p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-text-secondary hover:text-text-primary transition duration-150">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to candidates list
        </Link>

        {/* Profile General Summary Header */}
        <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{candidate.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-text-secondary">
                <span>{candidate.email}</span>
                {candidate.phone && <span>• {candidate.phone}</span>}
                <span>• Managed by {candidate.recruiter.name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs text-text-secondary font-medium">Pipeline Stage:</span>
            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
              {candidate.currentStage.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Core Profile Layout columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Dossier Details Column (Left - 2/3 span) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Resume Info */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-bold flex items-center mb-4 text-zinc-300">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Resume Highlights
              </h2>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 text-xs text-text-secondary leading-relaxed custom-scrollbar max-h-48 overflow-y-auto whitespace-pre-wrap">
                {candidate.resumeText || 'No resume text uploaded.'}
              </div>
            </div>

            {/* Interviews Scheduling & List */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-lg font-bold flex items-center text-zinc-300">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Interview Workflows
                </h2>
              </div>

              {/* Schedule form */}
              <form onSubmit={handleScheduleInterview} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
                <div className="sm:col-span-3 pb-1">
                  <h4 className="text-xs font-bold text-primary tracking-wide">Schedule New Stage Interview</h4>
                </div>
                <div>
                  <input
                    id="schedule-interview-title"
                    type="text"
                    required
                    value={intTitle}
                    onChange={(e) => setIntTitle(e.target.value)}
                    className="w-full p-2 rounded-lg glass-input text-xs"
                    placeholder="e.g. System Design Interview"
                  />
                </div>
                <div>
                  <input
                    id="schedule-interview-date"
                    type="datetime-local"
                    required
                    value={intDate}
                    onChange={(e) => setIntDate(e.target.value)}
                    className="w-full p-2 rounded-lg glass-input text-xs text-text-secondary cursor-pointer"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    id="schedule-interview-interviewer"
                    value={intInterviewerId}
                    onChange={(e) => setIntInterviewerId(e.target.value)}
                    className="flex-1 p-2 rounded-lg glass-input text-xs text-text-secondary cursor-pointer appearance-none"
                  >
                    {interviewers.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.role})
                      </option>
                    ))}
                  </select>
                  <button
                    id="schedule-interview-submit"
                    type="submit"
                    disabled={scheduling}
                    className="px-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {scheduling ? 'Scheduling...' : 'Add'}
                  </button>
                </div>
              </form>

              {/* Interviews listing */}
              <div className="space-y-3">
                {candidate.interviews.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-4">No interviews scheduled yet.</p>
                ) : (
                  candidate.interviews.map((int) => (
                    <div key={int.id} className="p-4 bg-zinc-900/20 border border-zinc-800/80 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-zinc-300">{int.title}</p>
                        <p className="text-[10px] text-text-secondary mt-1">
                          Scheduled: {new Date(int.scheduledAt).toLocaleString()} • Interviewer: {int.interviewer.name}
                        </p>
                        {int.feedback && (
                          <div className="mt-2 text-[11px] bg-zinc-950 p-2 border border-zinc-800 rounded-lg text-text-secondary">
                            <strong>Feedback:</strong> {int.feedback}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {int.rating && (
                          <div className="flex items-center text-xs font-bold text-yellow-400 bg-yellow-400/5 border border-yellow-400/10 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                            {int.rating}/5
                          </div>
                        )}
                        <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded-full border ${
                          int.status === 'COMPLETED' 
                            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}>
                          {int.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Scorecard Evaluations */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h2 className="text-lg font-bold flex items-center text-zinc-300">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                Recruiting Scorecard Evaluations
              </h2>

              {/* Submit Evaluation Form */}
              <form onSubmit={handleSubmitEvaluation} className="space-y-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-bold text-primary tracking-wide">Submit New Candidate Scorecard</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Technical Skills</label>
                    <select
                      id="scorecard-tech"
                      value={techScore}
                      onChange={(e) => setTechScore(parseInt(e.target.value))}
                      className="w-full p-2 rounded-lg glass-input text-xs cursor-pointer appearance-none"
                    >
                      <option value="1">1 - Deficient</option>
                      <option value="2">2 - Needs Training</option>
                      <option value="3">3 - Solid Competency</option>
                      <option value="4">4 - Highly Skilled</option>
                      <option value="5">5 - Subject Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Communication</label>
                    <select
                      id="scorecard-comm"
                      value={commScore}
                      onChange={(e) => setCommScore(parseInt(e.target.value))}
                      className="w-full p-2 rounded-lg glass-input text-xs cursor-pointer appearance-none"
                    >
                      <option value="1">1 - Deficient</option>
                      <option value="2">2 - Poor Clarity</option>
                      <option value="3">3 - Articulate & Direct</option>
                      <option value="4">4 - Exceptionally Articulate</option>
                      <option value="5">5 - Perfect Persuasion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Culture Fit</label>
                    <select
                      id="scorecard-culture"
                      value={cultScore}
                      onChange={(e) => setCultScore(parseInt(e.target.value))}
                      className="w-full p-2 rounded-lg glass-input text-xs cursor-pointer appearance-none"
                    >
                      <option value="1">1 - Negative Fit</option>
                      <option value="2">2 - Neutral Fit</option>
                      <option value="3">3 - Good Alignment</option>
                      <option value="4">4 - Highly Collaborative</option>
                      <option value="5">5 - Model Culture Champion</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Hiring Recommendation</label>
                  <select
                    id="scorecard-recommendation"
                    value={evalRec}
                    onChange={(e) => setEvalRec(e.target.value)}
                    className="w-full p-2 rounded-lg glass-input text-xs cursor-pointer appearance-none"
                  >
                    <option value="STRONG_REJECT">Strong Reject</option>
                    <option value="REJECT">Reject</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="HIRE">Recommend Hire</option>
                    <option value="STRONG_HIRE">Strong Recommend Hire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Detailed Evaluation Comments</label>
                  <textarea
                    id="scorecard-comments"
                    rows={3}
                    required
                    value={evalComments}
                    onChange={(e) => setEvalComments(e.target.value)}
                    className="w-full p-2.5 rounded-lg glass-input text-xs resize-none"
                    placeholder="Describe their performance, answers, strengths, or red flags..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    id="scorecard-submit"
                    type="submit"
                    disabled={submittingEval}
                    className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center cursor-pointer transition duration-150 disabled:opacity-50"
                  >
                    {submittingEval ? 'Submitting...' : 'Submit Scorecard'}
                  </button>
                </div>
              </form>

              {/* Evaluations list */}
              <div className="space-y-4">
                {candidate.evaluations.length === 0 ? (
                  <p className="text-xs text-text-secondary text-center py-4">No evaluations logged yet.</p>
                ) : (
                  candidate.evaluations.map((ev) => (
                    <div key={ev.id} className="p-4 bg-zinc-900/10 border border-zinc-800/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div>
                          <p className="text-xs font-bold text-zinc-300">{ev.user.name}</p>
                          <p className="text-[10px] text-text-secondary mt-0.5">{ev.user.role} • {new Date(ev.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                          ev.recommendation.includes('HIRE') 
                            ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                            : ev.recommendation.includes('REJECT')
                            ? 'bg-red-950/20 border-red-500/20 text-red-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}>
                          {ev.recommendation.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-zinc-950/40 p-1.5 border border-zinc-800/50 rounded-lg">
                          <p className="text-[9px] text-zinc-500 uppercase font-semibold">Tech</p>
                          <p className="text-xs font-bold mt-0.5 text-primary">{ev.technicalScore}/5</p>
                        </div>
                        <div className="bg-zinc-950/40 p-1.5 border border-zinc-800/50 rounded-lg">
                          <p className="text-[9px] text-zinc-500 uppercase font-semibold">Comm</p>
                          <p className="text-xs font-bold mt-0.5 text-primary">{ev.communicationScore}/5</p>
                        </div>
                        <div className="bg-zinc-950/40 p-1.5 border border-zinc-800/50 rounded-lg">
                          <p className="text-[9px] text-zinc-500 uppercase font-semibold">Culture</p>
                          <p className="text-xs font-bold mt-0.5 text-primary">{ev.cultureScore}/5</p>
                        </div>
                      </div>

                      <p className="text-xs text-text-secondary italic leading-relaxed">
                        "{ev.comments}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* AI Insights & Recommendation Column (Right - 1/3 span) */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-primary/20 pulse-border relative overflow-hidden flex flex-col justify-between">
              
              {/* Card background decorations */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center tracking-tight">
                    <Brain className="w-5 h-5 mr-2 text-primary animate-pulse" />
                    AI Insights & Rec
                  </h2>
                  
                  {candidate.aiAnalysis && (
                    <span className="flex items-center text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {candidate.aiAnalysis.matchScore}% Fit
                    </span>
                  )}
                </div>

                {/* AI Roster Analysis Output */}
                {analyzing ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-primary animate-pulse">Running FlowHire AI Models...</p>
                      <p className="text-[10px] text-text-secondary mt-1">Parsing resume text & evaluation cards</p>
                    </div>
                  </div>
                ) : !candidate.aiAnalysis ? (
                  <div className="py-8 text-center space-y-4">
                    <ShieldAlert className="w-10 h-10 text-zinc-600 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-400">AI analysis is not yet computed</p>
                      <p className="text-[10px] text-text-secondary mt-1">Compute candidate match scores and overall strength summaries using Gemini.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-zoom-in">
                    {/* Recommendation Level Badge */}
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">AI Recommendation</p>
                      <p className={`text-sm font-bold mt-1.5 uppercase ${
                        candidate.aiAnalysis.recommendation.includes('STRONG') 
                          ? 'text-emerald-400' 
                          : candidate.aiAnalysis.recommendation === 'REJECT' 
                          ? 'text-red-400' 
                          : 'text-zinc-300'
                      }`}>
                        {candidate.aiAnalysis.recommendation.replace('_', ' ')}
                      </p>
                    </div>

                    {/* Summary paragraph */}
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                      <p className="text-xs text-text-secondary leading-relaxed bg-zinc-950/20 p-3 border border-zinc-800/40 rounded-xl">
                        {candidate.aiAnalysis.summary}
                      </p>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Key Strengths</h4>
                      <ul className="space-y-1.5">
                        {aiStrengths.map((str, idx) => (
                          <li key={idx} className="flex items-start text-xs text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 mr-2 flex-shrink-0" />
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Areas to Vet</h4>
                      <ul className="space-y-1.5">
                        {aiWeaknesses.map((w, idx) => (
                          <li key={idx} className="flex items-start text-xs text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 mr-2 flex-shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <button
                id="run-ai-analysis-btn"
                disabled={analyzing}
                onClick={runAiAnalysis}
                className="w-full mt-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-200 flex items-center justify-center cursor-pointer shadow-lg shadow-primary/10 border border-primary-hover"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {candidate.aiAnalysis ? 'Recalculate AI Dossier' : 'Analyze Profile with AI'}
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
