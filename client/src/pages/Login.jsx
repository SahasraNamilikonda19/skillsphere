import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useEffect } from 'react';
export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();
  useEffect(() => {
  const token = localStorage.getItem('skillsphere_token');

  if (token) {
    navigate('/dashboard');
  }
}, []);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Login button clicked");

  if (!form.email || !form.password) {
    return setError("Please fill in all fields");
  }

  try {
    setLoading(true);

    const res = await api.post('/auth/login', form);

    if (res.data.success) {
      login(res.data.token, res.data.user); // ✅ correct
      navigate('/dashboard');
    }

  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="sahasra@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              className="input-field"
            />
          </div>  
          {/* Forgot Password Link */}
<div className="text-right">
  <Link
    to="/forgot-password"
    className="text-sm text-primary-600 hover:underline"
  >
    Forgot password?
  </Link>
</div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
}