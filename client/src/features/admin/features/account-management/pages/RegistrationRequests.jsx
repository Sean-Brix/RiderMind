import { useEffect, useState, useMemo } from 'react';
import RegistrationRequestTable from '../components/RegistrationRequestTable.jsx';
import RegistrationRequestDetailModal from '../components/RegistrationRequestDetailModal.jsx';

export default function RegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  async function fetchRequests() {
    try {
      setError('');
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filterStatus !== 'all' 
        ? `/api/auth/registration-requests?status=${filterStatus}`
        : '/api/auth/registration-requests';
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to load registration requests');
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    fetchRequests(); 
  }, [filterStatus]);

  function handleViewDetails(request) {
    setSelectedRequest(request);
    setShowDetailModal(true);
  }

  function handleRequestUpdated() {
    setShowDetailModal(false);
    setSelectedRequest(null);
    fetchRequests(); // Refresh the list
  }

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    let result = requests;

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
  }, [requests, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const approved = requests.filter(r => r.status === 'APPROVED').length;
    const rejected = requests.filter(r => r.status === 'REJECTED').length;

    return { total, pending, approved, rejected };
  }, [requests]);

  return (
    <div className="space-y-6 p-6">
      {/* Statistics Bar */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-wrap">
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
          </div>

          <button
            onClick={fetchRequests}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Search Requests
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400" />
            </div>
          </div>

          {/* Status Filter */}
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
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || filterStatus !== 'all' || sortBy !== 'newest') && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {filteredRequests.length} of {stats.total} requests
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
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

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          {error}
        </div>
      )}
      
      {/* Requests Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Registration Requests
            </h3>
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
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
        )}
      </div>

      {/* Detail Modal */}
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
