import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RequestSessionModal from '../components/session/RequestSessionModal';
export default function Profile() {
  const { id }          = useParams();
  const { user, updateUser } = useAuth();
  const queryClient     = useQueryClient();
  const isOwner         = user?._id === id;
  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [editBio,       setEditBio]       = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [bio,           setBio]           = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn:  () => api.get(`/users/${id}`).then(r => r.data)
  });

  const profile = data?.user;

  // Add skill to teach
  const addTeachSkill = useMutation({
    mutationFn: () => api.post(`/users/${id}/skills/teach`, { name: newTeachSkill }),
    onSuccess:  (res) => {
      queryClient.invalidateQueries(['user', id]);
      if (isOwner) updateUser(res.data.user);
      setNewTeachSkill('');
    }
  });

  // Add skill to learn
  const addLearnSkill = useMutation({
    mutationFn: () => api.post(`/users/${id}/skills/learn`, { name: newLearnSkill }),
    onSuccess:  (res) => {
      queryClient.invalidateQueries(['user', id]);
      if (isOwner) updateUser(res.data.user);
      setNewLearnSkill('');
    }
  });

  // Update bio
  const updateBio = useMutation({
    mutationFn: () => api.put(`/users/${id}`, { name: profile.name, bio }),
    onSuccess:  (res) => {
      queryClient.invalidateQueries(['user', id]);
      if (isOwner) updateUser(res.data.user);
      setEditBio(false);
    }
  });

  // Endorse user
  const endorse = useMutation({
    mutationFn: () => api.post(`/users/${id}/endorse`),
    onSuccess:  () => queryClient.invalidateQueries(['user', id])
  });

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading profile...</div>;
  if (!profile)  return <div className="text-center py-20 text-gray-400">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-500 text-sm">{profile.email}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-primary-600 font-medium">{profile.points} points</span>
                <span className="text-sm text-gray-400">{profile.badges?.length} badges</span>
                <span className="text-sm text-yellow-500">⭐ {profile.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>

          {/* Endorse button — only show if not owner */}
          {/* Actions — only show if not owner */}
{!isOwner && (
  <div className="flex gap-2">
    <button
      onClick={() => endorse.mutate()}
      disabled={endorse.isLoading}
      className="btn-secondary text-sm"
    >
      ⭐ Endorse
    </button>
    <button
      onClick={() => setShowModal(true)}
      className="btn-primary text-sm"
    >
      Book Session
    </button>
  </div>
)}
        </div>

        {/* Bio */}
        <div className="mt-4">
          {editBio ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio..."
                className="input-field flex-1"
              />
              <button onClick={() => updateBio.mutate()} className="btn-primary text-sm px-4">Save</button>
              <button onClick={() => setEditBio(false)} className="btn-secondary text-sm px-4">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-gray-600 text-sm">
                {profile.bio || (isOwner ? 'Add a bio to tell others about yourself...' : 'No bio yet')}
              </p>
              {isOwner && (
                <button
                  onClick={() => { setEditBio(true); setBio(profile.bio || ''); }}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills to Teach */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills I Teach</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.skillsToTeach?.length > 0 ? (
              profile.skillsToTeach.map((s, i) => (
                <span key={i} className="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full">
                  {s.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No skills added yet</p>
            )}
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newTeachSkill}
                onChange={(e) => setNewTeachSkill(e.target.value)}
                placeholder="e.g. React, Python..."
                className="input-field flex-1"
                onKeyDown={(e) => e.key === 'Enter' && newTeachSkill && addTeachSkill.mutate()}
              />
              <button
                onClick={() => newTeachSkill && addTeachSkill.mutate()}
                className="btn-primary text-sm px-4"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Skills to Learn */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills I Want to Learn</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.skillsToLearn?.length > 0 ? (
              profile.skillsToLearn.map((s, i) => (
                <span key={i} className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
                  {s.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No skills added yet</p>
            )}
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newLearnSkill}
                onChange={(e) => setNewLearnSkill(e.target.value)}
                placeholder="e.g. Machine Learning..."
                className="input-field flex-1"
                onKeyDown={(e) => e.key === 'Enter' && newLearnSkill && addLearnSkill.mutate()}
              />
              <button
                onClick={() => newLearnSkill && addLearnSkill.mutate()}
                className="btn-primary text-sm px-4"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="card md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Badges</h2>
          {profile.badges?.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {profile.badges.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-3 min-w-16">
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-xs text-gray-600 text-center">{b.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No badges earned yet. Complete sessions to earn badges!</p>
          )}
        </div>
      </div>
      {/* Session Request Modal */}
{showModal && profile && (
  <RequestSessionModal
    instructor={profile}
    onClose={() => setShowModal(false)}
  />
)}
    </div>
  );
}