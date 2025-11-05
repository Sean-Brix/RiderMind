import { useEffect, useState, useMemo } from 'react';
import AccountTable from '../components/AccountTable.jsx';
import AccountForm from '../components/AccountForm.jsx';
import AccountEditModal from '../components/AccountEditModal.jsx';
import RegistrationRequestTable from '../components/RegistrationRequestTable.jsx';
import RegistrationRequestDetailModal from '../components/RegistrationRequestDetailModal.jsx';
import Modal from '../../../../../components/Modal.jsx';

export default function AccountList() {
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' or 'requests'
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false); // New state for archive toggle
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  async function fetchUsers() {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account/list', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests() {
    try {
      setError('');
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filterStatus !== 'all' 
        ? `/api/auth/registration-requests?status=${filterStatus}`
        : '/api/auth/registration-requests';
      
      console.log('Fetching requests from:', url);
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      console.log('Response status:', res.ok, 'Data:', data);
      
      if (!res.ok) throw new Error(data.message || 'Failed to load registration requests');
      setRequests(data.data || []);
      console.log('Requests set to:', data.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    setLoading(true);
    if (activeTab === 'accounts') {
      fetchUsers();
    } else {
      fetchRequests();
    }
  }, [activeTab]);

  // Fetch requests on mount to get the count for tab badge
  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [filterStatus]);

  function handleAccountCreated() {
    setShowCreateModal(false);
    fetchUsers(); // Refresh the list
  }

  function handleEditUser(user) {
    setSelectedUser(user);
    setShowEditModal(true);
  }

  function handleAccountUpdated() {
    setShowEditModal(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh the list
  }

  function handleViewDetails(request) {
    setSelectedRequest(request);
    setShowDetailModal(true);
  }

  function handleRequestUpdated() {
    setShowDetailModal(false);
    setSelectedRequest(null);
    fetchRequests(); // Refresh the list
  }

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    let result = users;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.email?.toLowerCase().includes(query) ||
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.displayName?.toLowerCase().includes(query) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name-asc':
          return (a.first_name || a.email).localeCompare(b.first_name || b.email);
        case 'name-desc':
          return (b.first_name || b.email).localeCompare(a.first_name || a.email);
        case 'email-asc':
          return a.email.localeCompare(b.email);
        case 'email-desc':
          return b.email.localeCompare(a.email);
        default:
          return 0;
      }
    });

    return result;
  }, [users, searchQuery, filterRole, sortBy]);

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    let result = requests;

    // Filter by archive status
    // - if showArchived is false, only show PENDING requests
    // - if showArchived is true, only show APPROVED or REJECTED requests (exclude PENDING)
    if (!showArchived) {
      result = result.filter(req => req.status === 'PENDING');
    } else {
      result = result.filter(req => req.status === 'APPROVED' || req.status === 'REJECTED');
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(req => 
        req.email?.toLowerCase().includes(query) ||
        req.first_name?.toLowerCase().includes(query) ||
        req.last_name?.toLowerCase().includes(query) ||
        `${req.first_name} ${req.last_name}`.toLowerCase().includes(query) ||
        req.id?.toString().includes(query)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.requestedAt) - new Date(a.requestedAt);
        case 'oldest':
          return new Date(a.requestedAt) - new Date(b.requestedAt);
        case 'name-asc':
          return (a.first_name || a.email).localeCompare(b.first_name || b.email);
        case 'name-desc':
          return (b.first_name || b.email).localeCompare(a.first_name || a.email);
        default:
          return 0;
      }
    });

    return result;
  }, [requests, searchQuery, sortBy, showArchived]);

  // Statistics
  const stats = useMemo(() => {
    if (activeTab === 'accounts') {
      const total = users.length;
      const admins = users.filter(u => u.role === 'ADMIN').length;
      const regularUsers = users.filter(u => u.role === 'USER').length;
      const recentlyAdded = users.filter(u => {
        const daysSinceCreation = (Date.now() - new Date(u.createdAt)) / (1000 * 60 * 60 * 24);
        return daysSinceCreation <= 7;
      }).length;

      return { total, admins, regularUsers, recentlyAdded };
    } else {
      const total = requests.length;
      const pending = requests.filter(r => r.status === 'PENDING').length;
      const approved = requests.filter(r => r.status === 'APPROVED').length;
      const rejected = requests.filter(r => r.status === 'REJECTED').length;

      return { total, pending, approved, rejected };
    }
  }, [activeTab, users, requests]);

  return (
    <div className="space-y-6 p-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => {
              setActiveTab('accounts');
              setSearchQuery('');
              setFilterRole('all');
              setFilterStatus('all');
              setSortBy('newest');
            }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'accounts'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Accounts
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                {users.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('requests');
              setSearchQuery('');
              setFilterRole('all');
              setFilterStatus('all');
              setSortBy('newest');
            }}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Registration Requests
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                {requests.filter(r => r.status === 'PENDING').length}
              </span>
              {requests.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="ml-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Simplified Statistics Bar */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-wrap">
            {activeTab === 'accounts' ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Total:</span>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.total}</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Admins:</span>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.admins}</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Users:</span>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.regularUsers}</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">This Week:</span>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.recentlyAdded}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Total:</span>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.total}</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Pending:</span>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.pending}</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Approved:</span>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.approved}</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Rejected:</span>
                  <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{stats.rejected}</span>
                </div>
              </>
            )}
          </div>

          {/* Create Button / Refresh */}
          <div className="flex justify-end">
            {activeTab === 'accounts' ? (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Account
              </button>
            ) : (
              <button
                onClick={fetchRequests}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {activeTab === 'accounts' ? 'Search Users' : 'Search Requests'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={activeTab === 'accounts' ? 'Search by name or email...' : 'Search by name, email, or ID...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" />
            </div>
          </div>

          {/* Role/Status Filter */}
          {activeTab === 'accounts' ? (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          )}

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              {activeTab === 'accounts' && (
                <>
                  <option value="email-asc">Email (A-Z)</option>
                  <option value="email-desc">Email (Z-A)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || (activeTab === 'accounts' ? filterRole !== 'all' : filterStatus !== 'all') || sortBy !== 'newest') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {activeTab === 'accounts' ? filteredUsers.length : filteredRequests.length} of {activeTab === 'accounts' ? stats.total : stats.total} {activeTab === 'accounts' ? 'users' : 'requests'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterRole('all');
                setFilterStatus('all');
                setSortBy('newest');
              }}
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">{error}</div>}
      
      {/* Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {activeTab === 'accounts' ? 'User Accounts' : 'Registration Requests'}
            </h3>
            <div className="flex items-center gap-3">
              {activeTab === 'requests' && (
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    showArchived
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                  {showArchived && (
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                      {requests.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED').length}
                    </span>
                  )}
                </button>
              )}
              {activeTab === 'accounts' && (
                <button className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  Export to CSV
                </button>
              )}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
          </div>
        ) : activeTab === 'accounts' ? (
          filteredUsers.length > 0 ? (
            <AccountTable users={filteredUsers} onEdit={handleEditUser} />
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                No users found
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {searchQuery || filterRole !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No user accounts yet'}
              </p>
            </div>
          )
        ) : (
          filteredRequests.length > 0 ? (
            <RegistrationRequestTable 
              requests={filteredRequests} 
              onViewDetails={handleViewDetails}
            />
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                No registration requests found
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No registration requests yet'}
              </p>
            </div>
          )
        )}
      </div>

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title=""
        size="xlarge"
      >
        <AccountForm mode="create" onSuccess={handleAccountCreated} />
      </Modal>

      {/* Edit Account Modal */}
      {showEditModal && selectedUser && (
        <AccountEditModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleAccountUpdated}
        />
      )}

      {/* Registration Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <RegistrationRequestDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleRequestUpdated}
        />
      )}
    </div>
  );
}

// Icons
function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
