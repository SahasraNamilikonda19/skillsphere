import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar         from './components/common/Navbar';
import AIAssistant    from './components/ai/AIAssistant';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Explore        from './pages/Explore';
import Profile        from './pages/Profile';
import Sessions       from './pages/Sessions';
import SessionDetail  from './pages/SessionDetail';
import Leaderboard    from './pages/Leaderboard';
import TakeQuiz       from './pages/TakeQuiz';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/"                      element={<Landing />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/register"              element={<Register />} />
        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/explore"      element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/profile/:id"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/sessions"     element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
        <Route path="/session/:id"  element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
        <Route path="/leaderboard"  element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/quiz/:sessionId" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
      </Routes>
      <AIAssistant />
    </div>
  );
}