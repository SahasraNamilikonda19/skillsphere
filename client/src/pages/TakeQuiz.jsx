import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import QuizResults from '../components/quiz/QuizResults';

export default function TakeQuiz() {
  const { sessionId }               = useParams();
  const navigate                    = useNavigate();
  const [answers,     setAnswers]   = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results,     setResults]   = useState(null);
  const [error,       setError]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['quiz', sessionId],
    queryFn:  () => api.get(`/quiz/session/${sessionId}`).then(r => r.data)
  });

  const quiz = data?.quiz;

  const submitQuiz = useMutation({
    mutationFn: (answersArray) => api.post(`/quiz/${quiz._id}/submit`, {
      answers: answersArray
    }),
    onSuccess: (res) => {
      setResults(res.data);
      setShowResults(true);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Make sure all questions answered
    if (Object.keys(answers).length < quiz.questions.length) {
      return setError(`Please answer all ${quiz.questions.length} questions`);
    }

    // Convert answers object to array
    const answersArray = quiz.questions.map((_, i) => answers[i]);
    submitQuiz.mutate(answersArray);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading quiz...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-gray-500">No quiz found for this session</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Already submitted
  if (quiz.submission) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="card">
          <div className="text-4xl mb-3">
            {quiz.submission.passed ? '🎓' : '📚'}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Already Submitted
          </h1>
          <p className="text-gray-500 mb-4">
            You scored{' '}
            <span className="font-bold text-primary-600">
              {quiz.submission.score}%
            </span>
            {' '}— {quiz.submission.passed ? 'Passed ✅' : 'Not passed yet'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Back to Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Quiz Header */}
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.skill} Quiz</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>📝 {quiz.totalQuestions} questions</span>
          <span>🎯 Pass with {quiz.passingScore}%</span>
          <span>⏱ No time limit</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{Object.keys(answers).length} of {quiz.totalQuestions} answered</span>
          <span>{Math.round((Object.keys(answers).length / quiz.totalQuestions) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(answers).length / quiz.totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((q, qIndex) => (
          <div key={qIndex} className="card">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-primary-100 text-primary-700 text-sm font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                Q{qIndex + 1}
              </span>
              <h3 className="font-medium text-gray-900 leading-relaxed">
                {q.question}
              </h3>
            </div>

            <div className="space-y-3">
              {q.options.map((option, oIndex) => (
                <label
                  key={oIndex}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                    ${answers[qIndex] === oIndex
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={oIndex}
                    checked={answers[qIndex] === oIndex}
                    onChange={() => setAnswers({ ...answers, [qIndex]: oIndex })}
                    className="accent-primary-600"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitQuiz.isLoading}
          className="btn-primary w-full py-3 text-base"
        >
          {submitQuiz.isLoading
            ? 'Submitting...'
            : `Submit Quiz (${Object.keys(answers).length}/${quiz.totalQuestions} answered)`
          }
        </button>

      </form>

      {/* Results Modal */}
      {showResults && results && (
        <QuizResults
          results={results.results}
          score={results.score}
          passed={results.passed}
          total={results.total}
          correct={results.correct}
          skill={quiz.skill}
          onClose={() => navigate(-1)}
        />
      )}

    </div>
  );
}