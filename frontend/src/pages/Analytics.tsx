import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, Award, CheckCircle2, UserCheck, Loader2 } from 'lucide-react';

interface Candidate {
  id: string;
  currentStage: string;
  status: string;
  aiAnalysis: {
    matchScore: number;
    recommendation: string;
  } | null;
}

export const Analytics: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get('/candidates');
        setCandidates(response.data);
      } catch (err) {
        console.error('Error fetching candidates for analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="pl-64 min-h-screen bg-background flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-text-secondary text-sm">Generating workspace analytics charts...</p>
      </div>
    );
  }

  // Calculate statistics
  const total = candidates.length;
  const hired = candidates.filter((c) => c.status === 'HIRED').length;
  const active = candidates.filter((c) => c.status === 'ACTIVE').length;
  const rejected = candidates.filter((c) => c.status === 'REJECTED').length;

  // Pipeline stage breakdown
  const stagesMap: any = {
    APPLIED: 0,
    SCREENING: 0,
    TECH_INTERVIEW: 0,
    MGMT_INTERVIEW: 0,
    OFFER: 0,
    HIRED: 0,
    REJECTED: 0,
  };

  candidates.forEach((c) => {
    if (stagesMap[c.currentStage] !== undefined) {
      stagesMap[c.currentStage]++;
    }
  });

  const maxStageCount = Math.max(...Object.values(stagesMap) as number[], 1);

  // AI Fit Score Breakdown
  const analyzedCandidates = candidates.filter((c) => c.aiAnalysis !== null);
  const avgFitScore = analyzedCandidates.length > 0
    ? Math.round(analyzedCandidates.reduce((sum, c) => sum + (c.aiAnalysis?.matchScore || 0), 0) / analyzedCandidates.length)
    : 0;

  const recommendCount = analyzedCandidates.filter((c) => c.aiAnalysis?.recommendation.includes('RECOMMEND')).length;
  const recommendPercent = analyzedCandidates.length > 0 
    ? Math.round((recommendCount / analyzedCandidates.length) * 100) 
    : 0;

  return (
    <div className="pl-64 min-h-screen bg-background text-text-primary p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
              <BarChart3 className="w-8 h-8 text-primary mr-3" />
              Recruitment Analytics
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Performance metrics, stage distribution breakdown, and AI matching analytics.
            </p>
          </div>
        </div>

        {/* Funnel Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Candidate Pass-Through</p>
              <h3 className="text-2xl font-bold mt-2">Funnel Efficiency</h3>
              <p className="text-xs text-text-secondary mt-1">Total active candidates currently: <span className="text-blue-400 font-bold">{active}</span></p>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Workspace AI Averages</p>
              <h3 className="text-2xl font-bold mt-2 text-primary">{avgFitScore}% Match Score</h3>
              <p className="text-xs text-text-secondary mt-1">Across <span className="text-primary font-bold">{analyzedCandidates.length}</span> parsed resumes</p>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-primary">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-start justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Hiring Success Ratio</p>
              <h3 className="text-2xl font-bold mt-2 text-emerald-400">{recommendPercent}% Recommended</h3>
              <p className="text-xs text-text-secondary mt-1">Hired count: <span className="text-emerald-400 font-bold">{hired}</span> / Rejected: {rejected}</p>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Analytics Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Stage breakdown chart */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-md font-bold text-zinc-300">Pipeline Stage Distribution</h3>
            
            <div className="space-y-4">
              {Object.keys(stagesMap).map((stage) => {
                const count = stagesMap[stage];
                const percentage = Math.round((count / maxStageCount) * 100);
                
                return (
                  <div key={stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-400 uppercase tracking-wide">
                        {stage.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-zinc-300">{count} Candidates</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800/80">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stage === 'HIRED' 
                            ? 'bg-emerald-500' 
                            : stage === 'REJECTED' 
                            ? 'bg-red-500' 
                            : 'bg-primary'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI statistics chart */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <h3 className="text-md font-bold text-zinc-300 mb-6">AI Evaluation Insights</h3>
            
            <div className="grid grid-cols-2 gap-6 items-center flex-1">
              <div className="flex flex-col items-center justify-center space-y-3 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Radial progress representation */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle 
                      cx="56" cy="56" r="48" 
                      className="text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent"
                    />
                    <circle 
                      cx="56" cy="56" r="48" 
                      className="text-primary" strokeWidth="6" strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * avgFitScore) / 100} 
                      strokeLinecap="round" stroke="currentColor" fill="transparent"
                    />
                  </svg>
                  <span className="text-2xl font-black text-primary">{avgFitScore}%</span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-300">Average Match Score</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Based on resume text analysis</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-3 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Radial progress representation */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle 
                      cx="56" cy="56" r="48" 
                      className="text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent"
                    />
                    <circle 
                      cx="56" cy="56" r="48" 
                      className="text-emerald-400" strokeWidth="6" strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * recommendPercent) / 100} 
                      strokeLinecap="round" stroke="currentColor" fill="transparent"
                    />
                  </svg>
                  <span className="text-2xl font-black text-emerald-400">{recommendPercent}%</span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-300">AI Recommend Ratio</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Approved match recommendations</p>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-text-secondary mt-6 italic">
              *AI stats automatically update upon running new Gemini-powered candidate profile analyses.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
