import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function SetupTeam() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.createTeam({ name, description });
      await refreshProfile();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">Create your team</h1>
        <p className="text-slate-400 text-center text-sm mb-6">
          You need a team to start collaborating.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Team name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g. Alpha Team"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="What does your team do?"
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create team'}
          </button>
        </form>
      </div>
    </div>
  );
}
