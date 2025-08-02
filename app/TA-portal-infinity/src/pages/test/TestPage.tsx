import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test Page - Routing Working
        </h1>
        <p className="text-gray-600">
          If you can see this page, the routing is working correctly.
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Current Time</h2>
          <p>{new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
