import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RequestSessionModal from '../components/session/RequestSessionModal';
import { SkeletonCard } from '../components/common/Skeleton';

const POPULAR_SKILLS = ['Python', 'React', 'JavaScript', 'Design', 'Machine Learning', 'Java', 'Data Science', 'Node.js'];

export default function Explore() {
  const { user }                = useAuth();
  const [search, setSearch]     = useState('');
  const [query,  setQuery]      = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', query],
    queryFn:  () => api.get(`/users/search?skill=${query}`).then(r => r.data)
  });

  const users = data?.users || [];

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <div className="page-container animate-in">

      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Explore <span className="gradient-text">Peers</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Find the perfect peer instructor for any skill
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by skill — Python, React, Design..."
            className="input-field pl-11"
          />
        </div>
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
      </form>

      {/* Popular Skills */}
      {!query && (
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Popular skills:
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => { setSearch(skill); setQuery(skill); }}
                className="badge-primary hover:bg-primary-200 cursor-pointer transition-colors text-sm py-1.5 px-3"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {query ? `No peers found for "${query}"` : 'Search for a skill'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {query ? 'Try a different skill name' : 'Type a skill above to find peer instructors'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Found {users.length} peer{users.length !== 1 ? 's' : ''} for "{query}"
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <UserCard
                key={u._id}
                user={u}
                currentUser={user}
                onBook={() => setSelectedInstructor(u)}
              />
            ))}
          </div>
        </>
      )}

      {selectedInstructor && (
        <RequestSessionModal
          instructor={selectedInstructor}
          onClose={() => setSelectedInstructor(null)}
        />
      )}
    </div>
  );
}

function UserCard({ user, currentUser, onBook }) {
  return (
    <div className="card group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Avatar & Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-colored">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">{user.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-400">
              {'⭐'.repeat(Math.min(Math.round(user.rating || 0), 5))}
            </span>
            <span className="text-accent-500 font-semibold">⚡ {user.points} pts</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {user.bio}
        </p>
      )}

      {/* Skills */}
      <div className="mb-4 flex-1">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
          Teaches
        </p>
        <div className="flex flex-wrap gap-1.5">
          {user.skillsToTeach?.slice(0, 3).map((s, i) => (
            <span key={i} className="badge-primary text-xs">{s.name}</span>
          ))}
          {user.skillsToTeach?.length > 3 && (
            <span className="badge bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 text-xs">
              +{user.skillsToTeach.length - 3}
            </span>
          )}
          {user.skillsToTeach?.length === 0 && (
            <span className="text-xs text-gray-400">No skills listed yet</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
        <Link
          to={`/profile/${user._id}`}
          className="btn-secondary text-sm flex-1 text-center"
        >
          View Profile
        </Link>
        {currentUser?._id !== user._id && (
          <button
            onClick={onBook}
            className="btn-primary text-sm flex-1"
          >
            Book Session
          </button>
        )}
      </div>
    </div>
  );
}