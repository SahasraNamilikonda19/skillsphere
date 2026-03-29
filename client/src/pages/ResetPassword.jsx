import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ResetPassword() {
  const { token }               = useParams();
  const { login }               = useAuth();
  const navigate                = useNavigate();
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirm) {
      return setError('Please fill in both fields');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (password !== confirm) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      login(res.data.token, res.data.user);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Choose a strong password for your account
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 text-center">
            <div className="text-2xl mb-1">✅</div>
            <p className="font-medium">Password reset successfully!</p>
            <p className="text-sm mt-1">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
            {error.includes('expired') && (
              <div className="mt-2">
                <Link to="/forgot-password" className="text-primary-600 hover:underline font-medium">
                  Request a new reset link →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="input-field"
            />
            {confirm && password !== confirm && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
            {confirm && password === confirm && password.length >= 6 && (
              <p className="text-green-500 text-xs mt-1">✓ Passwords match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
          >
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}