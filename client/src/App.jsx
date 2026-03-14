import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing       from './pages/Landing';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Explore       from './pages/Explore';
import Profile       from './pages/Profile';
import Sessions      from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Leaderboard   from './pages/Leaderboard';

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/explore"     element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/sessions"    element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      <Route path="/session/:id" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
    </Routes>
  );
}