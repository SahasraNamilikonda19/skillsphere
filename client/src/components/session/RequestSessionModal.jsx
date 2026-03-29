import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export default function RequestSessionModal({ instructor, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    skill:       '',
    scheduledAt: '',
    duration:    60,
    message:     ''
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const requestSession = useMutation({
    mutationFn: () => api.post('/sessions', {
      instructorId: instructor._id,
      skill:        form.skill,
      scheduledAt:  form.scheduledAt,
      duration:     form.duration,
      message:      form.message
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to send request');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.skill) return setError('Please enter a skill');
    setError('');
    requestSession.mutate();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Request a Session</h2>
            <p className="text-sm text-gray-500 mt-0.5">with {instructor.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm text-center">
            Session request sent successfully!
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Quick skill select */}
        {instructor.skillsToTeach?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-2">CLICK TO SELECT SKILL</p>
            <div className="flex flex-wrap gap-2">
              {instructor.skillsToTeach.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, skill: s.name })}
                  className={`text-sm px-3 py-1 rounded-full border transition-colors
                    ${form.skill === s.name
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                    }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill you want to learn
            </label>
            <input
              type="text"
              value={form.skill}
              onChange={(e) => setForm({ ...form, skill: e.target.value })}
              placeholder="e.g. Python, React, Design..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Date and Time
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              className="input-field"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message to instructor
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell the instructor about your current level and what you want to learn..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestSession.isLoading || success}
              className="btn-primary flex-1"
            >
              {requestSession.isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}