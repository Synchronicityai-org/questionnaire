import React, { useEffect, useState, useRef } from "react";
import { Users, ListChecks, MessageSquare, Star, ChevronDown, ChevronRight } from "lucide-react";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useNavigate } from 'react-router-dom';

// Define allowed user roles as a TypeScript type
const USER_ROLES = ["PARENT", "CAREGIVER", "CLINICIAN", "ADMIN", "SME", "DOCTOR"] as const;
type UserRole = typeof USER_ROLES[number];

// Placeholder for user context or prop
const user = { role: "ADMIN" }; // Replace with real user context/prop

const PAGE_SIZE = 10;

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<'user-management' | 'user-milestone' | 'feedback-review' | 'dlm-review' | ''>('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [sortField, setSortField] = useState<'name' | 'role' | 'email' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [expandedParents, setExpandedParents] = useState<{ [userId: string]: boolean }>({});
  const [parentKidProfiles, setParentKidProfiles] = useState<{ [userId: string]: any[] }>({});
  const [loadingKids, setLoadingKids] = useState<{ [userId: string]: boolean }>({});
  const [kidMilestoneCounts, setKidMilestoneCounts] = useState<{ [kidId: string]: number }>({});
  const [parentMilestoneCounts, setParentMilestoneCounts] = useState<{ [parentId: string]: number }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedMenu === 'user-management') {
      fetchUsers(true);
    }
    // eslint-disable-next-line
  }, [selectedMenu]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || allLoaded || usersLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextToken && !isFetchingMore) {
        fetchUsers(false);
      }
    });
    observer.current.observe(loadMoreRef.current);
    return () => observer.current?.disconnect();
    // eslint-disable-next-line
  }, [nextToken, isFetchingMore, allLoaded, usersLoading]);

  const fetchUsers = async (reset: boolean) => {
    if (reset) {
      setUsers([]);
      setNextToken(null);
      setAllLoaded(false);
      setUsersLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    setUsersError(null);
    try {
      const client = generateClient<Schema>();
      const response = await client.models.User.list({
        limit: PAGE_SIZE,
        nextToken: reset ? undefined : nextToken || undefined,
      });
      if (response.data) {
        setUsers((prev) => reset ? response.data : [...prev, ...response.data]);
        setNextToken(response.nextToken || null);
        if (!response.nextToken) setAllLoaded(true);
      } else {
        if (reset) setUsers([]);
        setAllLoaded(true);
      }
    } catch (err) {
      setUsersError('Failed to fetch users');
      if (reset) setUsers([]);
    } finally {
      if (reset) setUsersLoading(false);
      else setIsFetchingMore(false);
    }
  };

  const handleShowAll = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const client = generateClient<Schema>();
      let allUsers: any[] = [];
      let token: string | null | undefined = undefined;
      do {
        const response: any = await client.models.User.list({ limit: PAGE_SIZE, nextToken: token });
        if (response.data) allUsers = [...allUsers, ...response.data];
        token = response.nextToken;
      } while (token);
      setUsers(allUsers);
      setNextToken(null);
      setAllLoaded(true);
    } catch (err) {
      setUsersError('Failed to fetch all users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!users.length) return;
    const header = ['Name', 'Role', 'Email', 'Status'];
    const rows = users.map(u => [
      `${u.fName} ${u.lName}`.trim(),
      u.role,
      u.email,
      u.status
    ]);
    const csvContent = [header, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    setUpdateError(null);
    try {
      const client = generateClient<Schema>();
      const userToUpdate = users.find((u) => u.id === userId);
      if (!userToUpdate) throw new Error('User not found');
      await client.models.User.update({
        id: userId,
        role: newRole,
      });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      setUpdateError('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleInactivate = async (userId: string) => {
    setUpdatingUserId(userId);
    setUpdateError(null);
    try {
      const client = generateClient<Schema>();
      await client.models.User.update({
        id: userId,
        status: 'INACTIVE',
      });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: 'INACTIVE' } : u));
    } catch (err) {
      setUpdateError('Failed to inactivate user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filtering logic
  const filteredUsers = users.filter((u) => {
    const search = searchText.trim().toLowerCase();
    const matchesSearch =
      search === '' ||
      (u.fName && u.fName.toLowerCase().includes(search)) ||
      (u.lName && u.lName.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search));
    const roleMatch = !filterRole || u.role === filterRole;
    const statusMatch = !filterStatus || u.status === filterStatus;
    return matchesSearch && roleMatch && statusMatch;
  });

  // Sorting logic
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: string = '';
    let bValue: string = '';
    switch (sortField) {
      case 'name':
        aValue = `${a.fName ?? ''} ${a.lName ?? ''}`.trim().toLowerCase();
        bValue = `${b.fName ?? ''} ${b.lName ?? ''}`.trim().toLowerCase();
        break;
      case 'role':
        aValue = (a.role ?? '').toLowerCase();
        bValue = (b.role ?? '').toLowerCase();
        break;
      case 'email':
        aValue = (a.email ?? '').toLowerCase();
        bValue = (b.email ?? '').toLowerCase();
        break;
      case 'status':
        aValue = (a.status ?? '').toLowerCase();
        bValue = (b.status ?? '').toLowerCase();
        break;
      default:
        break;
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'name' | 'role' | 'email' | 'status') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Fetch Kid Profiles for a parent
  const handleExpandParent = async (userId: string) => {
    setExpandedParents((prev) => ({ ...prev, [userId]: !prev[userId] }));
    if (!parentKidProfiles[userId]) {
      setLoadingKids((prev) => ({ ...prev, [userId]: true }));
      try {
        const client = generateClient<Schema>();
        const response = await client.models.KidProfile.list({
          filter: { parentId: { eq: userId } },
        });
        setParentKidProfiles((prev) => ({ ...prev, [userId]: response.data || [] }));
        // Fetch milestone counts for each kid and sum for parent
        if (response.data) {
          const counts: { [kidId: string]: number } = {};
          let parentTotal = 0;
          await Promise.all(
            response.data.map(async (kid: any) => {
              try {
                const milestoneResp = await client.models.MilestoneTask.list({
                  filter: { kidProfileId: { eq: kid.id }, type: { eq: 'MILESTONE' } },
                });
                const count = milestoneResp.data ? milestoneResp.data.length : 0;
                counts[kid.id] = count;
                parentTotal += count;
              } catch {
                counts[kid.id] = 0;
              }
            })
          );
          setKidMilestoneCounts((prev) => ({ ...prev, ...counts }));
          setParentMilestoneCounts((prev) => ({ ...prev, [userId]: parentTotal }));
        }
      } catch (err) {
        setParentKidProfiles((prev) => ({ ...prev, [userId]: [] }));
      } finally {
        setLoadingKids((prev) => ({ ...prev, [userId]: false }));
      }
    }
  };

  if (user.role !== "ADMIN" && user.role !== "SME") {
    return <div className="text-center text-red-600 mt-12">Access denied. This page is only for ADMIN/SME users.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col font-medium">
        <h1 className="text-2xl font-bold mb-8 text-indigo-600">Admin Panel</h1>
        <nav aria-label="Admin Panel">
          <ul className="flex flex-col divide-y divide-gray-200" role="menu">
            <li>
              <button
                type="button"
                role="menuitem"
                aria-current={selectedMenu === 'user-management' ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left font-medium transition-colors w-full box-border antialiased focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${selectedMenu === 'user-management' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500' : 'bg-white text-gray-700 border-l-4 border-transparent hover:bg-gray-100'}`}
                onClick={() => setSelectedMenu('user-management')}
                tabIndex={0}
                aria-label="User Management"
              >
                <Users className="w-5 h-5" aria-hidden="true" />
                User Management
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                aria-current={selectedMenu === 'user-milestone' ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left font-medium transition-colors w-full box-border antialiased focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${selectedMenu === 'user-milestone' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500' : 'bg-white text-gray-700 border-l-4 border-transparent hover:bg-gray-100'}`}
                onClick={() => setSelectedMenu('user-milestone')}
                tabIndex={0}
                aria-label="User Milestone"
              >
                <ListChecks className="w-5 h-5" aria-hidden="true" />
                User Milestone
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                aria-current={selectedMenu === 'feedback-review' ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left font-medium transition-colors w-full box-border antialiased focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${selectedMenu === 'feedback-review' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500' : 'bg-white text-gray-700 border-l-4 border-transparent hover:bg-gray-100'}`}
                onClick={() => setSelectedMenu('feedback-review')}
                tabIndex={0}
                aria-label="Feedback Review"
              >
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
                Feedback Review
              </button>
            </li>
            <li>
              <button
                type="button"
                role="menuitem"
                aria-current={selectedMenu === 'dlm-review' ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left font-medium transition-colors w-full box-border antialiased focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${selectedMenu === 'dlm-review' ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500' : 'bg-white text-gray-700 border-l-4 border-transparent hover:bg-gray-100'}`}
                onClick={() => setSelectedMenu('dlm-review')}
                tabIndex={0}
                aria-label="DLM Review"
              >
                <Star className="w-5 h-5" aria-hidden="true" />
                DLM Review
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        {selectedMenu === '' && (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">Select a module from the menu</div>
        )}
        {selectedMenu === 'user-management' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="text-indigo-500" /> User Management</h2>
              <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto md:justify-end">
                <input
                  type="text"
                  placeholder="Search users"
                  className="border rounded px-3 py-2 text-sm w-full md:w-48"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
                <select
                  className="border rounded px-3 py-2 text-sm w-full md:w-36"
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  {USER_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <select
                  className="border rounded px-3 py-2 text-sm w-full md:w-36"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                <button className="px-4 py-2 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition" onClick={handleShowAll} disabled={usersLoading || allLoaded}>Show All</button>
                <button className="px-4 py-2 rounded bg-green-100 text-green-700 hover:bg-green-200 transition" onClick={handleDownloadCSV} disabled={!users.length}>Download CSV</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100" style={{ width: '100%', maxWidth: '1200px', minWidth: '900px' }}>
              {usersLoading ? (
                <div className="text-center py-6 text-gray-500">Loading users...</div>
              ) : usersError ? (
                <div className="text-center py-6 text-red-500">{usersError}</div>
              ) : (
                <div className="relative" style={{ height: 480, maxHeight: 480, overflowY: 'auto' }}>
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="text-gray-500 text-sm select-none">
                        <th className="py-1 cursor-pointer" onClick={() => handleSort('name')}>
                          Name {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th className="py-1 cursor-pointer" onClick={() => handleSort('role')}>
                          Role {sortField === 'role' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th className="py-1 cursor-pointer" onClick={() => handleSort('email')}>
                          Email {sortField === 'email' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th className="py-1 cursor-pointer" onClick={() => handleSort('status')}>
                          Status {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th className="py-1">Milestones</th>
                        <th className="py-1">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.map((u) => (
                        <React.Fragment key={u.id}>
                          <tr className="bg-gray-50 hover:bg-gray-100 rounded">
                            <td className="py-2 px-2 rounded-l-lg font-medium flex items-center">
                              {u.role === 'PARENT' && (
                                <button
                                  className="mr-2 p-1 rounded hover:bg-gray-200 focus:outline-none"
                                  onClick={() => handleExpandParent(u.id)}
                                  aria-label={expandedParents[u.id] ? 'Collapse' : 'Expand'}
                                >
                                  {expandedParents[u.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                              )}
                              {u.fName} {u.lName}
                            </td>
                            <td className="py-2 px-2">
                              <select
                                className="border rounded px-2 py-1"
                                value={u.role}
                                disabled={updatingUserId === u.id || u.status === 'INACTIVE'}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              >
                                {USER_ROLES.map((role) => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-2">{u.email}</td>
                            <td className="py-2 px-2">{u.status}</td>
                            <td className="py-2 px-2 text-center">
                              {u.role === 'PARENT' ? (parentMilestoneCounts[u.id] ?? '…') : '-'}
                            </td>
                            <td className="py-2 px-2 rounded-r-lg">
                              <button
                                className={`px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition ${u.status === 'INACTIVE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={updatingUserId === u.id || u.status === 'INACTIVE'}
                                onClick={() => handleInactivate(u.id)}
                              >
                                {updatingUserId === u.id && u.status !== 'INACTIVE' ? 'Updating...' : 'Inactivate'}
                              </button>
                            </td>
                          </tr>
                          {/* Kid Profiles for Parent */}
                          {u.role === 'PARENT' && expandedParents[u.id] && (
                            <tr>
                              <td colSpan={5} className="bg-gray-50 px-6 pb-4 pt-2">
                                {loadingKids[u.id] ? (
                                  <div className="text-gray-500 py-2">Loading kid profiles...</div>
                                ) : parentKidProfiles[u.id]?.length === 0 ? (
                                  <div className="text-gray-400 py-2">No kid profiles found.</div>
                                ) : (
                                  <div className="space-y-4">
                                    {parentKidProfiles[u.id].map((kid) => (
                                      <div key={kid.id} className="bg-white rounded-lg shadow-sm p-4 mb-2 flex items-center justify-between">
                                        <div>
                                          <h3 className="text-lg font-medium text-gray-900">
                                            {kid.name}
                                            <span className="ml-2 text-xs text-gray-500">({kidMilestoneCounts[kid.id] ?? '…'} milestones)</span>
                                          </h3>
                                          <p className="text-sm text-gray-500">DOB: {kid.dob}</p>
                                        </div>
                                        <button
                                          className="ml-4 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-100 transition-colors"
                                          onClick={() => navigate(`/admin/kid-milestones/${kid.id}`)}
                                        >
                                          View Milestones
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  {/* Infinite scroll loader */}
                  {!allLoaded && (
                    <div ref={loadMoreRef} className="text-center py-4">
                      {isFetchingMore ? <span className="text-gray-500">Loading more users...</span> : <span className="text-gray-400">Scroll down to load more...</span>}
                    </div>
                  )}
                  {allLoaded && users.length > 0 && (
                    <div className="text-center py-4 text-gray-400">All users loaded.</div>
                  )}
                </div>
              )}
              {updateError && <div className="text-center text-red-500 mt-4">{updateError}</div>}
            </div>
          </div>
        )}
        {selectedMenu === 'user-milestone' && (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">User Milestone module coming soon...</div>
        )}
        {selectedMenu === 'feedback-review' && (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">Feedback Review module coming soon...</div>
        )}
        {selectedMenu === 'dlm-review' && (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">DLM Review module coming soon...</div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard; 