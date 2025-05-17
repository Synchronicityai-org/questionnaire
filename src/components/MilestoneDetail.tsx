import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { Loader2, ChevronLeft } from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────────
//  LOCAL TYPES & INLINE GRAPHQL (Gen 2‑only, Promise API)
// ────────────────────────────────────────────────────────────────────────────────
interface MilestoneTask {
  id: string;
  title: string;
  parentId: string;
  type: string;
  parentFriendlyDescription?: string | null;
  strategies?: string | null;
}

const LIST_TASKS = /* GraphQL */ `
  query ListMilestoneTasks($filter: ModelMilestoneTaskFilterInput, $limit: Int) {
    listMilestoneTasks(filter: $filter, limit: $limit) {
      items {
        id
        title
        parentId
        type
        parentFriendlyDescription
        strategies
      }
    }
  }
`;

const client = generateClient();

export default function MilestoneDetail() {
  // ──────────────────────────────────────────────────────────────────────────────
  // ROUTE PARAMS (robust to /milestone/:id or /milestone/:milestoneId)
  // ──────────────────────────────────────────────────────────────────────────────
  const params = useParams<Record<string, string | undefined>>();
  const milestoneId = params.id ?? params.milestoneId ?? undefined;

  // ──────────────────────────────────────────────────────────────────────────────
  // LOCAL STATE
  // ──────────────────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<MilestoneTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────────────────────────
  // DATA FETCH (single load + optional polling)
  // ──────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!milestoneId) return; // Wait until router param is present

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        console.debug("MilestoneDetail → fetching tasks", { milestoneId });
        const { data } = (await client.graphql({
          authMode: "apiKey",  // force API key so owner filtering doesn’t hide rows
          query: LIST_TASKS,
          variables: {
          filter: {
            parentId: { eq: milestoneId },
            type: { eq: "TASK" },
          },
          limit: 100,
        },
        })) as {
          data?: {
            listMilestoneTasks?: { items?: MilestoneTask[] };
          };
        };
        if (!cancelled) {
          setTasks(data?.listMilestoneTasks?.items ?? []);
        }
      } catch (err) {
        console.error("MilestoneDetail → GraphQL error", err);
        if (!cancelled) setError("Failed to load tasks. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Immediate fetch
    load();

    // OPTIONAL: poll every 30 s (remove if not desired)
    const pollId = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, [milestoneId]);

  // ──────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/kid-profile"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" /> Back to milestones
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Milestone Details</h1>

      {loading && (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <p className="mt-12 text-center text-red-600">{error}</p>
      )}

      {!loading && !error && tasks.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">No tasks found for this milestone.</p>
      )}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <li key={task.id} className="rounded-2xl border p-4 shadow-sm">
            <h2 className="line-clamp-2 text-lg font-medium leading-6">{task.title}</h2>
            {task.parentFriendlyDescription && (
              <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
                {task.parentFriendlyDescription}
              </p>
            )}
            {task.strategies && (
              <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
                <span className="font-medium text-gray-900">Strategies:</span> {task.strategies}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
