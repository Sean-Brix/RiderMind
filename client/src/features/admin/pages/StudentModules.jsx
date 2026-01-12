import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, BookOpen, CheckCircle, Clock, User, Hash, Calendar, TrendingUp } from 'lucide-react';
import { getAllStudentModules, getStudentModuleStats } from '../../../services/adminStudentModuleService';

export default function StudentModules() {
  const [studentModules, setStudentModules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch student modules when filters change
  useEffect(() => {
    fetchStudentModules();
  }, [searchQuery, statusFilter, sortBy, sortOrder, currentPage, itemsPerPage]);

  async function fetchStats() {
    try {
      const response = await getStudentModuleStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }

  async function fetchStudentModules() {
    try {
      setLoading(true);
      setError('');
      
      const response = await getAllStudentModules({
        search: searchQuery,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage
      });

      if (response.success) {
        setStudentModules(response.data.studentModules || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.currentPage || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student modules');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value) {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on new search
  }

  function handleStatusFilter(status) {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on filter change
  }

  function handleSort(field) {
    if (sortBy === field) {
      // Toggle order if clicking same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusBadge(status) {
    const badges = {
      ONGOING: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        icon: <Clock className="w-3 h-3" />
      },
      COMPLETED: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        icon: <CheckCircle className="w-3 h-3" />
      }
    };
    
    const badge = badges[status] || badges.ONGOING;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {status}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Student Modules
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage and monitor all student module enrollments and progress
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Enrollments</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total || 0}</p>
                </div>
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Ongoing</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.ongoing || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Avg Progress</p>
                  <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                    {stats.averageProgress ? `${Math.round(stats.averageProgress)}%` : '0%'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 mb-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by User ID or Student Module ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Status</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          ) : studentModules.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No Student Modules Found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchQuery ? 'Try adjusting your search criteria' : 'No student modules available'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-100 dark:bg-neutral-700">
                    <tr>
                      <th 
                        onClick={() => handleSort('id')}
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      >
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          Student Module ID
                          {sortBy === 'id' && (
                            <span className="text-brand-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('userId')}
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      >
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          User
                          {sortBy === 'userId' && (
                            <span className="text-brand-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th 
                        onClick={() => handleSort('status')}
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {sortBy === 'status' && (
                            <span className="text-brand-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        Quiz Score
                      </th>
                      <th 
                        onClick={() => handleSort('updatedAt')}
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      >
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Last Updated
                          {sortBy === 'updatedAt' && (
                            <span className="text-brand-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {studentModules.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-brand-600 dark:text-brand-400 font-semibold">
                          #{item.id}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {item.user?.first_name && item.user?.last_name 
                                ? `${item.user.first_name} ${item.user.last_name}`
                                : item.user?.email || 'Unknown'}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                              ID: {item.userId}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {item.module?.title || 'N/A'}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            Module ID: {item.moduleId}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-neutral-900 dark:text-white">
                            {item.category?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(item.progress >= 100 ? 'COMPLETED' : item.status)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                              <div 
                                className="bg-brand-600 dark:bg-brand-500 h-2 rounded-full transition-all"
                                style={{ width: `${item.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {item.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.quizScore !== null && item.quizScore !== undefined ? (
                            <span className={`text-sm font-semibold ${
                              item.quizScore >= 80 
                                ? 'text-green-600 dark:text-green-400' 
                                : item.quizScore >= 60 
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              {item.quizScore}%
                            </span>
                          ) : (
                            <span className="text-sm text-neutral-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDate(item.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-neutral-50 dark:bg-neutral-700/50 px-4 py-3 border-t border-neutral-200 dark:border-neutral-600">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
