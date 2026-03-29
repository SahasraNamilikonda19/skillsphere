import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const emptyQuestion = () => ({
  question:      '',
  options:       ['', '', '', ''],
  correctAnswer: 0
});

export default function CreateQuizModal({ session, onClose }) {
  const queryClient = useQueryClient();
  const [questions,     setQuestions]     = useState([emptyQuestion()]);
  const [passingScore,  setPassingScore]  = useState(70);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState(false);

  const createQuiz = useMutation({
    mutationFn: () => api.post('/quiz/create', {
      sessionId: session._id,
      questions,
      passingScore
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['session', session._id]);
      queryClient.invalidateQueries(['sessions']);
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create quiz');
    }
  });

  const addQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        return setError(`Question ${i + 1} is empty`);
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j].trim()) {
          return setError(`Question ${i + 1} — Option ${j + 1} is empty`);
        }
      }
    }

    createQuiz.mutate();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 my-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Quiz</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              for {session.skill} session
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm text-center">
            ✅ Quiz created successfully! Learner will be notified.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Passing Score */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passing Score: <span className="text-primary-600 font-bold">{passingScore}%</span>
            </label>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6 mb-6">
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="border border-gray-200 rounded-xl p-4"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Question {qIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="Enter your question..."
                  className="input-field mb-3"
                />

                {/* Options */}
                <div className="space-y-2">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctAnswer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                        className="accent-primary-600 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}${q.correctAnswer === oIndex ? ' (correct answer)' : ''}`}
                        className={`input-field flex-1 text-sm
                          ${q.correctAnswer === oIndex
                            ? 'border-green-400 bg-green-50'
                            : ''}`}
                      />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Select the radio button next to the correct answer
                </p>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <button
            type="button"
            onClick={addQuestion}
            className="btn-secondary w-full mb-6 text-sm"
          >
            + Add Another Question
          </button>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createQuiz.isLoading || success}
              className="btn-primary flex-1"
            >
              {createQuiz.isLoading ? 'Creating...' : `Create Quiz (${questions.length} questions)`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}