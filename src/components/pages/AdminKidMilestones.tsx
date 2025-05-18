import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

const client = generateClient<Schema>();

export default function AdminKidMilestones() {
  const { kidId } = useParams<{ kidId: string }>();
  const navigate = useNavigate();
  const [kid, setKid] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [tasksByMilestone, setTasksByMilestone] = useState<{ [milestoneId: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (!kidId) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch kid profile
        const kidResp = await client.models.KidProfile.get({ id: kidId });
        setKid(kidResp.data);
        // Fetch milestones
        const milestoneResp = await client.models.MilestoneTask.list({
          filter: { kidProfileId: { eq: kidId }, type: { eq: 'MILESTONE' } },
        });
        const milestonesData = milestoneResp.data || [];
        setMilestones(milestonesData);
        // Fetch all tasks for all milestones in parallel
        const tasksResults = await Promise.all(
          milestonesData.map(async (milestone: any) => {
            try {
              const resp = await client.models.MilestoneTask.list({
                filter: { parentId: { eq: milestone.id }, type: { eq: 'TASK' } },
              });
              return [milestone.id, resp.data || []];
            } catch {
              return [milestone.id, []];
            }
          })
        );
        const tasksMap: { [milestoneId: string]: any[] } = {};
        tasksResults.forEach(([id, tasks]) => {
          tasksMap[id] = tasks;
        });
        setTasksByMilestone(tasksMap);
      } catch (err) {
        setError('Failed to load milestones.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [kidId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading milestones...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:underline hover:text-gray-700 mb-6 bg-transparent border-none p-0"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Admin Dashboard
      </button>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {kid?.name || 'Kid'}'s Milestones
        </h1>
        <p className="text-gray-600">DOB: {kid?.dob || 'N/A'}</p>
      </div>
      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No milestones found for this kid profile.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="border rounded p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-700">{milestone.title}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  milestone.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {milestone.status?.replace('_', ' ') || 'NOT_STARTED'}
                </span>
              </div>
              {milestone.developmentalOverview && (
                <div className="text-gray-600 text-sm mt-1">{milestone.developmentalOverview}</div>
              )}
              {milestone.strategies && (
                <div className="text-gray-700 text-sm mt-2"><span className="font-medium">Strategy:</span> {milestone.strategies}</div>
              )}
              {/* Feedback placeholder if available */}
              {milestone.feedback && (
                <div className="text-gray-700 text-sm mt-2"><span className="font-medium">Feedback:</span> {milestone.feedback}</div>
              )}
              <div className="mt-3">
                <div className="font-medium text-gray-800 mb-1">Tasks:</div>
                {tasksByMilestone[milestone.id] === undefined ? (
                  <div className="text-gray-400 text-xs">Loading tasks...</div>
                ) : tasksByMilestone[milestone.id]?.length === 0 ? (
                  <div className="text-gray-400 text-xs">No tasks found for this milestone.</div>
                ) : (
                  <ul className="ml-4 list-disc space-y-1">
                    {tasksByMilestone[milestone.id].map((task: any) => (
                      <li key={task.id}>
                        <span className="font-medium text-gray-700">{task.title}</span>
                        {task.parentFriendlyDescription && (
                          <span className="text-gray-500 text-xs ml-2">{task.parentFriendlyDescription}</span>
                        )}
                        {task.strategies && (
                          <div className="text-gray-600 text-xs ml-2">Strategy: {task.strategies}</div>
                        )}
                        {task.feedback && (
                          <div className="text-gray-600 text-xs ml-2">Feedback: {task.feedback}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 