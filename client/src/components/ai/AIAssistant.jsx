import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SUGGESTED_QUESTIONS = [
  'Who should I contact to learn Python?',
  'How do sessions work?',
  'How do I earn badges?',
  'Who are the top instructors?',
  'How does the quiz system work?'
];

export default function AIAssistant() {
  const { user }                        = useAuth();
  const [isOpen,    setIsOpen]          = useState(false);
  const [messages,  setMessages]        = useState([]);
  const [input,     setInput]           = useState('');
  const [loading,   setLoading]         = useState(false);
  const [history,   setHistory]         = useState([]);
  const messagesEndRef                  = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message when opened first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role:    'assistant',
        content: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm your SkillSphere AI Assistant. I can help you find the right peers, explain how the platform works, or answer any questions you have. What would you like to know?`
      }]);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');

    // Add user message to UI
    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message:             messageText,
        conversationHistory: history
      });

      const assistantMessage = {
        role:    'assistant',
        content: res.data.reply
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation history for context
      setHistory(prev => [
        ...prev,
        { role: 'user',      content: messageText        },
        { role: 'assistant', content: res.data.reply }
      ].slice(-10)); // keep last 10 messages for context

    } catch (err) {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Sorry, I ran into an error. Please try again! 😅'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setHistory([]);
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden"
          style={{ height: '500px' }}
        >
          {/* Header */}
          <div className="bg-primary-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                AI
              </div>
              <div>
                <p className="text-white font-medium text-sm">SkillSphere Assistant</p>
                <p className="text-primary-200 text-xs">Powered by Claude AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-primary-200 hover:text-white text-xs transition-colors"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-primary-200 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold mr-2 flex-shrink-0 mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold mr-2 flex-shrink-0">
                  AI
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggested questions — show after welcome message */}
            {messages.length === 1 && !loading && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 text-center">Try asking:</p>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs bg-gray-50 hover:bg-primary-50 hover:text-primary-700 text-gray-600 px-3 py-2 rounded-lg border border-gray-100 hover:border-primary-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-gray-100 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask me anything..."
              className="input-field flex-1 text-sm py-2"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 group"
        title="AI Assistant"
      >
        {isOpen ? (
          <span className="text-xl">×</span>
        ) : (
          <span className="text-2xl">🤖</span>
        )}

        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute w-full h-full rounded-full bg-primary-400 animate-ping opacity-20" />
        )}
      </button>
    </>
  );
}