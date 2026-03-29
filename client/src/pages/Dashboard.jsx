import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { SkeletonStat, SkeletonList } from '../components/common/Skeleton';

const STAT_CARDS = [
  { key: 'points',    label: 'Total Points',       icon: '⚡', bg: 'bg-card-blue',   emoji: '🌟' },
  { key: 'badges',    label: 'Badges Earned',      icon: '🏅', bg: 'bg-card-purple', emoji: '✨' },
  { key: 'pending',   label: 'Pending Sessions',   icon: '⏳', bg: 'bg-card-orange', emoji: '📅' },
  { key: 'completed', label: 'Sessions Completed', icon: '✅', bg: 'bg-card-green',  emoji: '🎯' },
];

export default function Dashboard() {
  const { user } = useAuth();

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => api.get('/sessions').then(r => r.data)
  });

  const sessions  = sessionsData?.sessions || [];
  const pending   = sessions.filter(s => s.status === 'pending').length;
  const completed = sessions.filter(s => s.status === 'completed').length;

  const statValues = {
    points:    user?.points    || 0,
    badges:    user?.badges?.length || 0,
    pending,
    completed
  };

  return (
    <div className="page-container animate-in">

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your learning journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
        ) : (
          STAT_CARDS.map(({ key, label, icon, bg }) => (
            <div key={key} className={`card-gradient ${bg} text-white`}>
              <div className="text-3xl mb-1">{icon}</div>
              <div className="text-3xl font-bold">{statValues[key]}</div>
              <div className="text-sm text-white text-opacity-80 mt-1">{label}</div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action, i) => (
          <Link
            key={i}
            to={action.path === 'profile' ? `/profile/${user?._id}` : `/${action.path}`}
            className="card-hover group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 ${action.bg} group-hover:scale-110 transition-transform duration-300`}>
              {action.icon}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
              {action.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Skills */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Skills I Teach</h2>
            <Link
              to={`/profile/${user?._id}`}
              className="text-sm text-primary-600 hover:underline font-medium"
            >
              + Add Skill
            </Link>
          </div>
          {user?.skillsToTeach?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skillsToTeach.map((s, i) => (
                <span key={i} className="badge-primary">{s.name}</span>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-gray-400 text-sm">No skills added yet.</p>
              <Link to={`/profile/${user?._id}`} className="btn-primary mt-3 text-sm">
                Add your first skill
              </Link>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Badges</h2>
          {user?.badges?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.badges.slice(0, 8).map((b, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 hover:scale-110 transition-transform cursor-default"
                  title={b.name}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-16 truncate">
                    {b.name}
                  </span>
                </div>
              ))}
              {user.badges.length > 8 && (
                <div className="flex flex-col items-center justify-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 min-w-16">
                  <span className="text-sm font-bold text-gray-500">+{user.badges.length - 8}</span>
                  <span className="text-xs text-gray-400">more</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-gray-400 text-sm">
                No badges yet. Complete sessions and quizzes to earn badges!
              </p>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Sessions</h2>
            <Link to="/sessions" className="text-sm text-primary-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          {isLoading ? (
            <SkeletonList count={2} />
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-gray-400 text-sm mb-4">No sessions yet.</p>
              <Link to="/explore" className="btn-primary text-sm">
                Find a Peer
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 3).map(session => {
                const isInstructor = session.instructor?._id === user?._id;
                const other        = isInstructor ? session.learner : session.instructor;
                return (
                  <Link
                    key={session._id}
                    to={`/session/${session._id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {other?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {session.skill}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {isInstructor ? 'Teaching' : 'Learning from'} {other?.name}
                      </p>
                    </div>
                    <span className={`badge flex-shrink-0
                      ${session.status === 'accepted'  ? 'badge-success' :
                        session.status === 'pending'   ? 'badge-warning' :
                        session.status === 'completed' ? 'badge-primary' :
                        'bg-gray-100 text-gray-500'}`}
                    >
                      {session.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const quickActions = [
  { path: 'explore',  icon: '🔍', bg: 'bg-blue-50',   title: 'Find a Peer',    desc: 'Browse peers and book a session' },
  { path: 'sessions', icon: '📅', bg: 'bg-purple-50', title: 'My Sessions',    desc: 'View and manage your sessions' },
  { path: 'profile',  icon: '👤', bg: 'bg-green-50',  title: 'My Profile',     desc: 'Update your skills and availability' },
];