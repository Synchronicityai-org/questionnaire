import React from 'react';

const mockKid = {
  name: 'Ayaan',
  age: 5,
  diagnosis: 'Autism Spectrum Disorder',
};

const mockMilestones = [
  {
    id: '1',
    title: 'Improve Social Engagement',
    progress: 'In Progress',
  },
  {
    id: '2',
    title: 'Enhance Language Skills',
    progress: 'Not Started',
  },
];

const mockTeam = [
  { id: 'u1', name: 'Dr. Smith (Clinician)' },
  { id: 'u2', name: 'Sara Johnson (Caregiver)' },
];

export default function DemoDashboard() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, Parent</h1>

      {/* Child Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Child</h2>
        <div className="space-y-2">
          <p className="text-gray-700"><span className="font-semibold">Name:</span> {mockKid.name}</p>
          <p className="text-gray-700"><span className="font-semibold">Age:</span> {mockKid.age}</p>
          <p className="text-gray-700"><span className="font-semibold">Diagnosis:</span> {mockKid.diagnosis}</p>
        </div>
      </div>

      {/* Milestones Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Milestones</h2>
        <div className="space-y-4">
          {mockMilestones.map(m => (
            <div key={m.id} className="flex justify-between items-center">
              <span className="text-gray-700">{m.title}</span>
              <span className="text-sm text-gray-500">{m.progress}</span>
            </div>
          ))}
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            View Tasks
          </button>
        </div>
      </div>

      {/* Team Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Team</h2>
        <div className="space-y-4">
          {mockTeam.map(member => (
            <div key={member.id} className="text-gray-700">{member.name}</div>
          ))}
          <button className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Manage Team
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Start Questionnaire
        </button>
        <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
          Give Feedback
        </button>
      </div>
    </div>
  );
}
