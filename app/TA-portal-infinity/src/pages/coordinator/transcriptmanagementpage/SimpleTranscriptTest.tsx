import React from 'react';

const SimpleTranscriptTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Simple Transcript Page Test
        </h1>
        <p className="text-gray-600 mb-4">
          This is a simplified test page to verify routing is working.
        </p>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <p className="text-green-600">✅ Component loaded successfully</p>
          <p className="text-blue-600">📅 Current time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTranscriptTest;
