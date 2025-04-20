import React from 'react';
import { useNavigate } from 'react-router-dom';

const KidProfileHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Vikrant</h1>
          <p className="text-gray-600">Here's how Vikrant is progressing today</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/assessment')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Take Assessment
          </button>
          <button
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            View Past Assessments
          </button>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <span role="img" aria-label="target" className="text-4xl">🎯</span>
          </div>
          <h2 className="text-xl font-semibold mb-3">Ready to Begin Your Journey?</h2>
          <p className="text-gray-600 mb-6">
            Complete a quick assessment to receive personalized milestones and tasks for Vikrant.
            We'll create a custom development plan based on your responses.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/assessment')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Start Assessment Now
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Milestone Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Current Milestone</h2>
            <span role="img" aria-label="milestone" className="text-2xl">🏆</span>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span role="img" aria-label="skills" className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Social Communication Skills</h3>
                <p className="text-gray-500 text-sm">Coming soon after assessment</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Support Team Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Vikrant's Support Team</h2>
            <button className="text-blue-600 hover:text-blue-700">
              Manage Team
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span role="img" aria-label="team" className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-gray-600">Build your support network</p>
                <p className="text-sm text-gray-500">Add therapists, teachers, and family members</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Overall Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <span role="img" aria-label="communication" className="text-2xl mr-2">💭</span>
              <h3 className="font-medium">Communication</h3>
            </div>
            <div className="h-2 bg-gray-200 rounded-full"></div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <span role="img" aria-label="behavior" className="text-2xl mr-2">🌟</span>
              <h3 className="font-medium">Behavior</h3>
            </div>
            <div className="h-2 bg-gray-200 rounded-full"></div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <span role="img" aria-label="social" className="text-2xl mr-2">🤝</span>
              <h3 className="font-medium">Social Skills</h3>
            </div>
            <div className="h-2 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Community Insights Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Community Insights</h2>
          <span className="text-sm text-gray-500">Preview</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium mb-2">Visual Schedule Success</h3>
            <p className="text-gray-600 text-sm">
              Using a visual schedule during morning routine helped reduce anxiety and improved transitions.
            </p>
            <div className="mt-3 text-sm text-gray-500 flex items-center">
              <span>24</span>
              <span role="img" aria-label="thumbs up" className="mx-1">👍</span>
              <span>about 1 hour ago by Emily K.</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium mb-2">Coming Soon</h3>
            <p className="text-gray-500 text-sm">More community insights will appear here after assessment</p>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-medium mb-2">Coming Soon</h3>
            <p className="text-gray-500 text-sm">More community insights will appear here after assessment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidProfileHome; 