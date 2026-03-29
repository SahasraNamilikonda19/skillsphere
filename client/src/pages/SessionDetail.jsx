
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';

import CreateQuizModal from '../components/quiz/CreateQuizModal';
export default function SessionDetail() {
  const { id }          = useParams();
  const { user }        = useAuth();
  const socket          = useSocket();
  const [messages,  setMessages]  = useState([]);
  const [newMsg,    setNewMsg]    = useState('');
  const [tab,       setTab]       = useState('chat');
  const [connected, setConnected] = useState(false);
  const messagesEndRef            = useRef(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['session', id],
    queryFn:  () => api.get(`/sessions/${id}`).then(r => r.data)
  });

  const session = data?.session;

  // Join session room when socket is ready
  useEffect(() => {
    if (!socket || !id) return;

    // Join the room
    socket.emit('join-session', id);
    setConnected(true);
    console.log('Joined session room:', id);

    // Listen for incoming messages
    const handleMessage = (msg) => {
      console.log('Received message:', msg);
      setMessages(prev => [...prev, msg]);
    };

    socket.on('receive-message', handleMessage);

    // Cleanup when leaving the page
    return () => {
      socket.off('receive-message', handleMessage);
    };
  }, [socket, id]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMsg.trim() || !socket) return;

    const msg = {
      sender: {
        _id:  user._id,
        name: user.name
      },
      content:   newMsg,
      createdAt: new Date().toISOString()
    };

    // Emit to server
    socket.emit('send-message', { sessionId: id, message: msg });

    // Add to own messages immediately
    setMessages(prev => [...prev, msg]);
    setNewMsg('');
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-400">Loading session...</div>;
  }

  if (!session) {
    return <div className="text-center py-20 text-gray-400">Session not found</div>;
  }

  const isInstructor = session.instructor?._id === user?._id;
  const other        = isInstructor ? session.learner : session.instructor;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Session Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.skill}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isInstructor ? 'Teaching' : 'Learning from'}: {other?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-400">
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
              ${session.status === 'accepted'  ? 'bg-green-100 text-green-700'   :
                session.status === 'completed' ? 'bg-blue-100 text-blue-700'     :
                session.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'}`}
            >
              {session.status}
            </span>
          </div>
        </div>

        {/* Video Link */}
        {session.status === 'accepted' && session.meetingLink && (
          
            <a href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block mt-4 text-sm"
          >
            📹 Join Video Session
          </a>
        )}
        {/* Quiz Actions */}
{session.status === 'completed' && (
  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
    {isInstructor && !session.quizAssigned && (
      <button
        onClick={() => setShowQuizModal(true)}
        className="btn-primary text-sm"
      >
        📝 Create Quiz for Learner
      </button>
    )}
    {isInstructor && session.quizAssigned && (
      <span className="text-sm text-green-600 font-medium">
        ✅ Quiz assigned to learner
      </span>
    )}
    {!isInstructor && session.quizAssigned && !session.quizCompleted && (
      <Link
        to={`/quiz/${session._id}`}
        className="btn-primary text-sm"
      >
        📝 Take Quiz
      </Link>
    )}
    {!isInstructor && session.quizCompleted && (
      <span className={`text-sm font-medium ${session.quizPassed ? 'text-green-600' : 'text-red-500'}`}>
        {session.quizPassed ? '🎓 Quiz Passed!' : '❌ Quiz not passed'}
      </span>
    )}
  </div>
)}

{/* Create Quiz Modal */}
{showQuizModal && (
  <CreateQuizModal
    session={session}
    onClose={() => setShowQuizModal(false)}
  />
)}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 mb-6">
        {['chat', 'details'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-medium capitalize transition-colors
              ${tab === t
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {t === 'chat' ? '💬 Chat' : '📋 Details'}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab === 'chat' && (
        <div className="card">

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto mb-4 flex flex-col gap-3 pr-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-400 text-sm">
                  No messages yet. Say hello to {other?.name}!
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender?._id === user?._id;
                return (
                  <div
                    key={i}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Other user avatar */}
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold mr-2 flex-shrink-0 mt-1">
                        {msg.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="max-w-xs">
                      {!isMe && (
                        <p className="text-xs text-gray-400 mb-1 ml-1">
                          {msg.sender?.name}
                        </p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm
                        ${isMe
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className={`text-xs text-gray-300 mt-1
                        ${isMe ? 'text-right' : 'text-left'}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour:   '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2 border-t border-gray-100 pt-4">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Message ${other?.name}...`}
              className="input-field flex-1"
            />
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim()}
              className="btn-primary px-5 disabled:opacity-50"
            >
              Send
            </button>
          </div>

        </div>
      )}

      {/* Details Tab */}
      {tab === 'details' && (
        <div className="card">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Skill</span>
              <span className="font-medium">{session.skill}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Status</span>
              <span className="font-medium capitalize">{session.status}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Instructor</span>
              <span className="font-medium">{session.instructor?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Learner</span>
              <span className="font-medium">{session.learner?.name}</span>
            </div>
            {session.scheduledAt && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Scheduled</span>
                <span className="font-medium">
                  {new Date(session.scheduledAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {session.message && (
              <div className="py-2">
                <span className="text-gray-500 block mb-1">Message</span>
                <p className="text-gray-700">{session.message}</p>
              </div>
            )}
            {session.meetingLink && (
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Meeting Link</span>
                
                  <a href={session.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Join Video Call
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}