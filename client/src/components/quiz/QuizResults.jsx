export default function QuizResults({ results, score, passed, total, correct, skill, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">

        {/* Score Header */}
        <div className={`text-center p-6 rounded-xl mb-6
          ${passed ? 'bg-green-50' : 'bg-red-50'}`}
        >
          <div className="text-5xl mb-3">{passed ? '🎓' : '📚'}</div>
          <h2 className="text-2xl font-bold text-gray-900">{score}%</h2>
          <p className={`text-sm font-medium mt-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? 'You Passed!' : 'Not Passed Yet'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {correct} out of {total} correct
          </p>
          {passed && (
            <div className="mt-3 bg-green-100 text-green-700 text-sm px-4 py-2 rounded-full inline-block">
              🏆 Badge earned: {skill} Quiz Passed
            </div>
          )}
        </div>

        {/* Question Results */}
        <h3 className="font-semibold text-gray-900 mb-4">Question Review</h3>
        <div className="space-y-4 mb-6">
          {results.map((r, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border
                ${r.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{r.isCorrect ? '✅' : '❌'}</span>
                <p className="font-medium text-gray-900 text-sm">{r.question}</p>
              </div>
              <div className="ml-7 space-y-1">
                <p className="text-sm text-gray-600">
                  Your answer:{' '}
                  <span className={r.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {r.yourAnswer}
                  </span>
                </p>
                {!r.isCorrect && (
                  <p className="text-sm text-gray-600">
                    Correct answer:{' '}
                    <span className="text-green-600 font-medium">{r.correctAnswer}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-primary w-full">
          Done
        </button>

      </div>
    </div>
  );
}