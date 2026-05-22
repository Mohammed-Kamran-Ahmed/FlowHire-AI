import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, UserPlus, Search, Filter, 
  ArrowRight, Sparkles, CheckCircle2, 
  XCircle, Clock, Plus, Loader2, Phone, Mail
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  currentStage: string;
  status: string;
  updatedAt: string;
  aiAnalysis: {
    matchScore: number;
    recommendation: string;
  } | null;
}

export const Dashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  
  // Modal for new candidate
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const { user } = useAuth();

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

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      await api.post('/candidates', {
        name,
        email,
        phone,
        resumeText,
        currentStage: 'APPLIED',
      });
      
      // Clean form fields
      setName('');
      setEmail('');
      setPhone('');
      setResumeText('');
      setIsModalOpen(false);
      
      // Refresh candidates list
      fetchCandidates();
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to create candidate. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  // Calculations for stats cards
  const totalCount = candidates.length;
  const activeCount = candidates.filter(c => c.status === 'ACTIVE').length;
  const hiredCount = candidates.filter(c => c.status === 'HIRED').length;
  const rejectedCount = candidates.filter(c => c.status === 'REJECTED').length;
  const offerSuccessRate = totalCount > 0 ? Math.round((hiredCount / totalCount) * 100) : 0;

  // Filter candidates list
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = stageFilter === '' || candidate.currentStage === stageFilter;
    
    return matchesSearch && matchesStage;
  });

  const getStageBadge = (stage: string) => {
    const badges: any = {
      APPLIED: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      SCREENING: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
      TECH_INTERVIEW: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
      MGMT_INTERVIEW: 'bg-orange-900/20 text-orange-400 border-orange-500/20',
      OFFER: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
      HIRED: 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20',
      REJECTED: 'bg-red-900/20 text-red-400 border-red-500/20',
    };
    return badges[stage] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
  };

  return (
    <div className="pl-64 min-h-screen bg-background text-text-primary p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Dashboard</h1>
            <p className="text-text-secondary text-sm mt-1">
              Welcome back, <span className="text-primary font-medium">{user?.name}</span>. Manage candidates and track hiring progress.
            </p>
          </div>
          <button
            id="add-candidate-btn"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition duration-200 flex items-center shadow-lg shadow-primary/10 cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Candidate
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Candidates</p>
              <h3 className="text-3xl font-bold mt-2">{totalCount}</h3>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-primary">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Active Pipeline</p>
              <h3 className="text-3xl font-bold mt-2 text-blue-400">{activeCount}</h3>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Hired (Success)</p>
              <h3 className="text-3xl font-bold mt-2 text-emerald-400">{hiredCount}</h3>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Hiring Success Rate</p>
              <h3 className="text-3xl font-bold mt-2 text-purple-400">{offerSuccessRate}%</h3>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Candidates Table List */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Controls Header */}
          <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Candidate Roster</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  id="candidate-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary w-full sm:w-64 transition duration-150"
                  placeholder="Search by name or email..."
                />
              </div>

              {/* Stage Filter */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Filter className="w-4 h-4" />
                </span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary transition duration-150 cursor-pointer appearance-none"
                >
                  <option value="">All Stages</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="TECH_INTERVIEW">Technical Interview</option>
                  <option value="MGMT_INTERVIEW">Manager Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-text-secondary text-sm">Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">
              No candidates found matching the filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-900/20">
                    <th className="p-4 pl-6">Candidate Details</th>
                    <th className="p-4">Recruitment Stage</th>
                    <th className="p-4">AI Scorecard Match</th>
                    <th className="p-4">AI Recommendation</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-zinc-900/30 transition duration-150">
                      <td className="p-4 pl-6">
                        <div>
                          <p className="font-semibold text-sm">{candidate.name}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-text-secondary">
                            <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> {candidate.email}</span>
                            {candidate.phone && <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" /> {candidate.phone}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStageBadge(candidate.currentStage)}`}>
                          {candidate.currentStage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        {candidate.aiAnalysis ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-12 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${candidate.aiAnalysis.matchScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-primary">{candidate.aiAnalysis.matchScore}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {candidate.aiAnalysis ? (
                          <span className={`text-xs font-bold ${
                            candidate.aiAnalysis.recommendation.includes('STRONG') 
                              ? 'text-emerald-400' 
                              : candidate.aiAnalysis.recommendation === 'REJECT' 
                              ? 'text-red-400' 
                              : 'text-zinc-300'
                          }`}>
                            {candidate.aiAnalysis.recommendation.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">Awaiting AI Run</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <Link
                          to={`/candidate/${candidate.id}`}
                          className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-hover transition duration-150"
                        >
                          View Profile
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full rounded-2xl overflow-hidden p-6 animate-fade-in-up border border-white/10 relative">
            <h2 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Create Candidate Profile
            </h2>
            <p className="text-xs text-text-secondary mb-6">Enter candidates background and details to schedule interview screening</p>

            {modalError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-200 rounded-lg text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCandidate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
                  <input
                    id="new-candidate-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-lg glass-input text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Email Address</label>
                  <input
                    id="new-candidate-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg glass-input text-sm"
                    placeholder="john.doe@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Phone Number (Optional)</label>
                <input
                  id="new-candidate-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg glass-input text-sm"
                  placeholder="+1 555-0199"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Resume Highlights / Experience</label>
                <textarea
                  id="new-candidate-resume"
                  rows={4}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full p-2.5 rounded-lg glass-input text-sm resize-none custom-scrollbar"
                  placeholder="Paste details of their resume here (e.g. 4 years React experience, Backend Node developer...) to feed AI insights."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-xs font-semibold cursor-pointer text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  id="submit-candidate-btn"
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold transition duration-200 flex items-center cursor-pointer"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    'Add Candidate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
