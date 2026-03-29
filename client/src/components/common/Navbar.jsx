import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, logout }      = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate              = useNavigate();
  const location              = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-colored group-hover:scale-110 transition-transform">
              S
            </div>
            <span className="font-bold text-lg gradient-text">SkillSphere</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {[
                { path: '/explore',     label: 'Explore',     icon: '🔍' },
                { path: '/sessions',    label: 'Sessions',    icon: '📅' },
                { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
                { path: '/dashboard',   label: 'Dashboard',   icon: '📊' },
              ].map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive(path)
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {user ? (
              <>
                {/* User Avatar */}
                <Link
                  to={`/profile/${user._id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>

                {/* Points Badge */}
                <div className="hidden sm:flex items-center gap-1 bg-accent-50 text-accent-600 px-2.5 py-1 rounded-full text-xs font-bold dark:bg-accent-900 dark:text-accent-400">
                  ⚡ {user.points || 0}
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:block text-sm text-gray-400 hover:text-red-500 transition-colors px-2"
                >
                  Logout
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {menuOpen ? '✕' : '☰'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && user && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-3 animate-slide-down">
            {[
              { path: '/explore',     label: 'Explore',     icon: '🔍' },
              { path: '/sessions',    label: 'Sessions',    icon: '📅' },
              { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
              { path: '/dashboard',   label: 'Dashboard',   icon: '📊' },
              { path: `/profile/${user._id}`, label: 'My Profile', icon: '👤' },
            ].map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive(path)
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition-colors mt-2"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}