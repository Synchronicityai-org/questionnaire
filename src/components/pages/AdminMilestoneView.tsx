import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { ChevronLeft } from 'lucide-react';

const client = generateClient();

const GET_KID_PROFILE = /* GraphQL */ `
  query GetKidProfile($id: ID!) {
    getKidProfile(id: $id) {
      id
      name
      dob
    }
  }
`;

const LIST_MILESTONES = /* GraphQL */ `
  query ListMilestoneTasks($filter: ModelMilestoneTaskFilterInput, $limit: Int) {
    listMilestoneTasks(filter: $filter, limit: $limit) {
      items {
        id
        title
        type
        parentId
        status
        parentFriendlyDescription
        strategies
        developmentalOverview
        kidProfileId
      }
    }
  }
`;

interface MilestoneTask {
  id: string;
  title: string;
  type: string;
  parentId?: string;
  status: string;
  parentFriendlyDescription?: string;
  strategies?: string;
  developmentalOverview?: string;
  kidProfileId: string;
}

interface KidProfile {
  id: string;
  name: string;
  dob: string;
}

export default function AdminMilestoneView() {
  const { kidProfileId } = useParams<{ kidProfileId: string }>();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<MilestoneTask[]>([]);
  const [kidProfile, setKidProfile] = useState<KidProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!kidProfileId) return;
      try {
        setLoading(true);
        setError(null);

        // Fetch kid profile with API key
        const kidResp = await client.graphql({
          authMode: 'apiKey',
          query: GET_KID_PROFILE,
          variables: { id: kidProfileId }
        }) as { data?: { getKidProfile?: KidProfile } };
        if (!kidResp.data?.getKidProfile) {
          throw new Error('Kid profile not found');
        }
        setKidProfile({
          id: kidResp.data.getKidProfile.id ?? '',
          name: kidResp.data.getKidProfile.name ?? '',
          dob: kidResp.data.getKidProfile.dob ?? ''
        });

        // Fetch milestones with API key
        const milestoneResp = await client.graphql({
          authMode: 'apiKey',
          query: LIST_MILESTONES,
          variables: {
            filter: {
              kidProfileId: { eq: kidProfileId },
              type: { eq: 'MILESTONE' }
            },
            limit: 100
          }
        }) as { data?: { listMilestoneTasks?: { items?: MilestoneTask[] } } };
        const items = milestoneResp.data?.listMilestoneTasks?.items ?? [];
        // Sanitize milestone data
        const sanitized = items.map((m: any) => ({
          id: m.id ?? '',
          title: m.title ?? '',
          type: m.type ?? 'MILESTONE',
          parentId: m.parentId ?? undefined,
          status: m.status ?? 'NOT_STARTED',
          parentFriendlyDescription: m.parentFriendlyDescription ?? '',
          strategies: m.strategies ?? '',
          developmentalOverview: m.developmentalOverview ?? '',
          kidProfileId: m.kidProfileId ?? ''
        }));
        setMilestones(sanitized);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load milestones. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [kidProfileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading milestones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Admin Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {kidProfile?.name}'s Milestones
        </h1>
        <p className="text-gray-600">
          DOB: {kidProfile?.dob}
        </p>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600">No milestones found for this kid profile.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {milestone.title}
              </h2>
              {milestone.developmentalOverview && (
                <p className="text-gray-600 mb-4">
                  {milestone.developmentalOverview}
                </p>
              )}
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  milestone.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {milestone.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 