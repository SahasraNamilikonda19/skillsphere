import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Leaderboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn:  () => api.get('/users/leaderboard').then(r => r.data)
  });

  const users = data?.users || [];

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 mt-1">Top contributors on SkillSphere</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading leaderboard...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u, index) => (
            <div
              key={u._id}
              className={`card flex items-center gap-4
                ${u._id === user?._id ? 'border-primary-200 bg-primary-50' : ''}`}
            >
              {/* Rank */}
              <div className="text-2xl w-8 text-center">
                {index < 3 ? medals[index] : <span className="text-gray-400 text-sm font-bold">#{index + 1}</span>}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {u.name?.charAt(0).toUpperCase()}
              </div>

              {/* Name & Skills */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{u.name}</h3>
                  {u._id === user?._id && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {u.skillsToTeach?.slice(0, 2).map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Points & Badges */}
              <div className="text-right">
                <div className="font-bold text-primary-600">{u.points} pts</div>
                <div className="text-xs text-gray-400">{u.badges?.length} badges</div>
              </div>

              {/* View Profile */}
              <Link to={`/profile/${u._id}`} className="btn-secondary text-xs px-3 py-1">
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}