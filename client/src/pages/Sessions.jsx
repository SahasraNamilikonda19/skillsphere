import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_COLORS = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted:  'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200'
};

export default function Sessions() {
  const { user }    = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn:  () => api.get('/sessions').then(r => r.data)
  });

  const sessions = data?.sessions || [];

  const filtered = tab === 'all'
    ? sessions
    : sessions.filter(s => s.status === tab);

  // Accept session
  const accept = useMutation({
    mutationFn: (id) => api.put(`/sessions/${id}/accept`),
    onSuccess:  () => queryClient.invalidateQueries(['sessions'])
  });

  // Reject session
  const reject = useMutation({
    mutationFn: (id) => api.put(`/sessions/${id}/reject`),
    onSuccess:  () => queryClient.invalidateQueries(['sessions'])
  });

  // Complete session
  const complete = useMutation({
    mutationFn: (id) => api.put(`/sessions/${id}/complete`),
    onSuccess:  () => queryClient.invalidateQueries(['sessions'])
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-500 mt-1">Manage your learning and teaching sessions</p>
        </div>
        <Link to="/explore" className="btn-primary">
          + Book Session
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {['all', 'pending', 'accepted', 'completed'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors
              ${tab === t
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading sessions...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-gray-500">No sessions found.</p>
          <Link to="/explore" className="btn-primary mt-4 inline-block">
            Find a Peer
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((session) => {
            const isInstructor = session.instructor?._id === user?._id;
            const other        = isInstructor ? session.learner : session.instructor;

            return (
              <div key={session._id} className="card">
                <div className="flex items-start justify-between">
                  {/* Session Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                      {other?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{session.skill}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[session.status]}`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {isInstructor ? 'Teaching' : 'Learning from'}: {other?.name}
                      </p>
                      {session.scheduledAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          📅 {new Date(session.scheduledAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* Instructor actions on pending sessions */}
                    {isInstructor && session.status === 'pending' && (
                      <>
                        <button
                          onClick={() => accept.mutate(session._id)}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => reject.mutate(session._id)}
                          className="btn-secondary text-sm px-3 py-1"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Mark complete */}
                    {isInstructor && session.status === 'accepted' && (
                      <button
                        onClick={() => complete.mutate(session._id)}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        Mark Complete
                      </button>
                    )}

                    {/* View details */}
                    <Link
                      to={`/session/${session._id}`}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      View
                    </Link>
                  </div>
                </div>

                {/* Meeting link for accepted sessions */}
                {session.status === 'accepted' && session.meetingLink && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      📹 Join Video Session
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}