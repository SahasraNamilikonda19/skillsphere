import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="animate-in">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero min-h-screen flex items-center">

        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300 opacity-10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce-soft">
            🚀 The Future of Peer Learning is Here
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Learn from Peers.
            <br />
            <span className="text-yellow-300">Teach What You Know.</span>
          </h1>

          <p className="text-xl text-white text-opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
            SkillSphere connects learners with peer instructors for real-time
            sessions, AI-powered matching, quizzes, and skill validation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/explore" className="btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-50 shadow-xl">
                🔍 Explore Peers
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                >
                  🎯 Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="bg-white bg-opacity-20 text-white border-2 border-white border-opacity-40 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-opacity-30 transition-all duration-200"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Social proof */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-white text-opacity-80">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">500+</div>
              <div className="text-sm">Skills Available</div>
            </div>
            <div className="w-px bg-white bg-opacity-20 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">1,200+</div>
              <div className="text-sm">Sessions Completed</div>
            </div>
            <div className="w-px bg-white bg-opacity-20 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">800+</div>
              <div className="text-sm">Active Learners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to
              <span className="gradient-text"> grow your skills</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              A complete ecosystem for peer-based learning — built for students, by students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="card-hover group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${f.bg} group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Get started in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-medium ${s.bg}`}>
                  {s.icon}
                </div>
                <div className="text-primary-600 font-bold text-sm mb-2">Step {i + 1}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-hero">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to start your learning journey?
          </h2>
          <p className="text-white text-opacity-80 mb-8 text-lg">
            Join thousands of learners and instructors on SkillSphere today. It's free!
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block"
          >
            🚀 Create Free Account
          </Link>
        </div>
      </section>

    </div>
  );
}

const features = [
  { icon: '🤝', bg: 'bg-blue-50',   title: 'Peer-to-Peer Learning',   desc: 'Learn directly from peers who have mastered the skills you want to develop.' },
  { icon: '🤖', bg: 'bg-purple-50', title: 'AI-Powered Assistant',     desc: 'Get instant recommendations on which peers to contact for any skill.' },
  { icon: '🎯', bg: 'bg-green-50',  title: 'Post-Session Quizzes',     desc: 'Validate your learning with quizzes after every session and earn badges.' },
  { icon: '🏆', bg: 'bg-yellow-50', title: 'Gamification',             desc: 'Earn points, badges, and climb the leaderboard as you learn and teach.' },
  { icon: '💬', bg: 'bg-pink-50',   title: 'Real-Time Chat',           desc: 'Chat with your instructor or learner during sessions instantly.' },
  { icon: '📹', bg: 'bg-orange-50', title: 'Video Sessions',           desc: 'Connect face-to-face with peers through integrated video calls.' },
];

const steps = [
  { icon: '👤', bg: 'bg-blue-100',   title: 'Create your profile',  desc: 'Add skills you can teach and skills you want to learn.' },
  { icon: '🔍', bg: 'bg-purple-100', title: 'Find a peer',          desc: 'Search for peers by skill and book a real-time session.' },
  { icon: '🎓', bg: 'bg-green-100',  title: 'Learn and earn',       desc: 'Complete sessions, pass quizzes, and earn badges and points.' },
];