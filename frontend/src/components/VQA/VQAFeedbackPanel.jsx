// src/components/vqa/VQAFeedbackPanel.jsx
import React from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const VQAFeedbackPanel = ({ validationResult, onNext, onRetry, hasMore }) => {
    if (!validationResult) return null;

    const { isCorrect, similarityScore, feedback, correctNodes, incorrectNodes, missedNodes } = validationResult;

    // Fallback: If similarity is 100% or feedback indicates success, treat as correct
    const isActuallyCorrect = isCorrect || similarityScore === 1.0 || feedback?.toLowerCase().includes('excellent');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 ${
                isActuallyCorrect ? 'border-4 border-green-500' : 'border-4 border-red-500'
            }`}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    {isActuallyCorrect ? (
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    ) : (
                        <XCircle className="w-16 h-16 text-red-600" />
                    )}
                    <div>
                        <h2 className={`text-3xl font-bold ${
                            isActuallyCorrect ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {isActuallyCorrect ? 'Correct!' : 'Incorrect'}
                        </h2>
                        <p className="text-gray-600 mt-1">{feedback}</p>
                    </div>
                </div>

                {/* Similarity Score */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Similarity Score</span>
                        <span className="text-lg font-bold text-indigo-600">
              {(similarityScore * 100).toFixed(0)}%
            </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all ${
                                similarityScore >= 0.8 ? 'bg-green-500' :
                                    similarityScore >= 0.5 ? 'bg-yellow-500' :
                                        'bg-red-500'
                            }`}
                            style={{ width: `${similarityScore * 100}%` }}
                        />
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-700">
                            {correctNodes?.length || 0}
                        </div>
                        <div className="text-xs text-green-600 mt-1">Correct Nodes</div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-700">
                            {incorrectNodes?.length || 0}
                        </div>
                        <div className="text-xs text-red-600 mt-1">Incorrect Nodes</div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-700">
                            {missedNodes?.length || 0}
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">Missed Nodes</div>
                    </div>
                </div>

                {/* Node Details */}
                {!isCorrect && missedNodes && missedNodes.length > 0 && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                            Missed Nodes:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {missedNodes.map((node, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-xs font-medium text-yellow-800"
                                >
                  {node.split('/').pop() || node}
                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {!isActuallyCorrect && (
                        <button
                            onClick={onRetry}
                            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                    {hasMore ? (
                        <button
                            onClick={onNext}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Next Question
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={onNext}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Finish
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VQAFeedbackPanel;