import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      return setError('Please enter your email address');
    }

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 mt-2 text-sm">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-semibold text-green-800 mb-1">Email Sent!</h3>
              <p className="text-green-600 text-sm">
                We sent a password reset link to{' '}
                <strong>{email}</strong>.
                Check your inbox and spam folder.
              </p>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Didn't receive the email?{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-primary-600 hover:underline font-medium"
              >
                Try again
              </button>
            </p>
            <Link to="/login" className="btn-secondary w-full block text-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sahasra@example.com"
                  className="input-field"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Sending reset link...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Back to login */}
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}