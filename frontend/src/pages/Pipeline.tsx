import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Kanban, ArrowLeftRight, ChevronRight, User, Sparkles, Loader2 } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  currentStage: string;
  status: string;
  aiAnalysis: {
    matchScore: number;
    recommendation: string;
  } | null;
}

const STAGES = [
  { id: 'APPLIED', title: 'Applied', color: 'border-t-zinc-600' },
  { id: 'SCREENING', title: 'Screening', color: 'border-t-blue-500' },
  { id: 'TECH_INTERVIEW', title: 'Technical Interview', color: 'border-t-purple-500' },
  { id: 'MGMT_INTERVIEW', title: 'Manager Interview', color: 'border-t-orange-500' },
  { id: 'OFFER', title: 'Offer', color: 'border-t-yellow-500' },
  { id: 'HIRED', title: 'Hired', color: 'border-t-emerald-500' },
  { id: 'REJECTED', title: 'Rejected', color: 'border-t-red-500' },
];

export const Pipeline: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates');
      setCandidates(response.data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const moveCandidate = async (candidateId: string, nextStage: string) => {
    setUpdatingId(candidateId);
    try {
      await api.patch(`/candidates/${candidateId}/stage`, { currentStage: nextStage });
      fetchCandidates();
    } catch (err) {
      console.error('Error shifting candidate stage:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStage = (current: string): string | null => {
    const idx = STAGES.findIndex(s => s.id === current);
    if (idx !== -1 && idx < STAGES.length - 1) {
      // Don't shift Hired/Rejected further
      if (current === 'HIRED' || current === 'REJECTED') return null;
      return STAGES[idx + 1].id;
    }
    return null;
  };

  return (
    <div className="pl-64 min-h-screen bg-background text-text-primary p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
              <Kanban className="w-8 h-8 text-primary mr-3" />
              Candidate Pipeline
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Visualize recruitment progress and shift candidate workflow stages.
            </p>
          </div>
        </div>

        {/* Board Columns Grid */}
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-text-secondary text-sm">Loading visual pipeline board...</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
            {STAGES.map((stage) => {
              const stageCandidates = candidates.filter(c => c.currentStage === stage.id);
              
              return (
                <div 
                  key={stage.id} 
                  className="flex-shrink-0 w-80 bg-zinc-900/25 border border-zinc-800 rounded-2xl flex flex-col max-h-[calc(100vh-200px)] overflow-hidden"
                >
                  {/* Column Header */}
                  <div className={`p-4 border-b border-zinc-800/80 border-t-2 ${stage.color} flex justify-between items-center bg-zinc-900/60`}>
                    <h3 className="font-bold text-sm tracking-wide">{stage.title}</h3>
                    <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700/60 rounded-full text-xs font-bold text-zinc-400">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Cards List container */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar min-h-[300px]">
                    {stageCandidates.length === 0 ? (
                      <div className="h-28 border border-dashed border-zinc-800/60 rounded-xl flex items-center justify-center text-xs text-zinc-600">
                        No candidates
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => {
                        const next = getNextStage(candidate.currentStage);
                        
                        return (
                          <div 
                            key={candidate.id} 
                            className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition duration-150 relative group shadow-sm flex flex-col justify-between space-y-4"
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <Link 
                                  to={`/candidate/${candidate.id}`}
                                  className="text-sm font-semibold hover:text-primary transition duration-150 cursor-pointer"
                                >
                                  {candidate.name}
                                </Link>
                                {candidate.aiAnalysis && (
                                  <span className="flex items-center text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                                    {candidate.aiAnalysis.matchScore}%
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-text-secondary mt-1 truncate">{candidate.email}</p>
                            </div>

                            {/* Card Footer controls */}
                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
                              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                                {candidate.status}
                              </span>
                              
                              {next && (
                                <button
                                  id={`move-stage-${candidate.id}`}
                                  disabled={updatingId === candidate.id}
                                  onClick={() => moveCandidate(candidate.id, next)}
                                  className="p-1 bg-zinc-800 hover:bg-zinc-700 hover:text-primary border border-zinc-700/60 rounded-lg text-zinc-400 transition duration-150 cursor-pointer disabled:opacity-50 flex items-center text-[10px] px-2 font-medium"
                                  title={`Promote to ${STAGES.find(s => s.id === next)?.title}`}
                                >
                                  Shift Stage
                                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
