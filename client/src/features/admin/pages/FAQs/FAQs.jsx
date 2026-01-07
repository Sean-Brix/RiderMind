import React, { useState, useEffect } from 'react';
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from '../../../../services/faqService';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import ConfirmDeleteModal from '../../modules/components/ConfirmDeleteModal';
import PageHeader from '../../components/PageHeader';

const FAQ_CATEGORIES = ['General', 'System', 'Module', 'Quiz'];

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFAQs, setSelectedFAQs] = useState([]);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    isActive: true
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await getAllFAQs(null, null);
      setFaqs(response.data);
      setError(null);
    } catch (err) {
      setError(err.error || 'Failed to fetch FAQs');
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentFAQ) {
        await updateFAQ(currentFAQ.id, formData);
      } else {
        await createFAQ(formData);
      }
      
      await fetchFAQs();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.error || 'Failed to save FAQ');
      console.error('Error saving FAQ:', err);
    }
  };

  const handleEdit = (faq) => {
    setCurrentFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setFaqToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;

    try {
      await deleteFAQ(faqToDelete);
      await fetchFAQs();
      setDeleteConfirmOpen(false);
      setFaqToDelete(null);
    } catch (err) {
      setError(err.error || 'Failed to delete FAQ');
      console.error('Error deleting FAQ:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      isActive: true
    });
    setCurrentFAQ(null);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleFAQSelection = (id) => {
    setSelectedFAQs(prev =>
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    );
  };

  const toggleAllFAQs = () => {
    if (selectedFAQs.length === filteredFAQs.length) {
      setSelectedFAQs([]);
    } else {
      setSelectedFAQs(filteredFAQs.map(faq => faq.id));
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category) => {
    return category === 'All' 
      ? faqs.length 
      : faqs.filter(faq => faq.category === category).length;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
      {/* Sidebar - Category Filter */}
      <div className="w-64 bg-gradient-to-b from-white via-blue-50/50 to-purple-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 border-r border-gray-200 dark:border-neutral-700 overflow-y-auto backdrop-blur-sm">
        <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
        </div>
        
        <nav className="p-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center justify-between ${
              selectedCategory === 'All'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
            }`}
          >
            <span>All FAQs</span>
            <span className={`text-sm px-2 py-0.5 rounded-full ${
              selectedCategory === 'All'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-400'
            }`}>
              {getCategoryCount('All')}
            </span>
          </button>

          <div className="mt-4 mb-2 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            By Category
          </div>

          {FAQ_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center justify-between ${
                selectedCategory === category
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
              }`}
            >
              <span>{category}</span>
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                selectedCategory === category
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-400'
              }`}>
                {getCategoryCount(category)}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-white via-blue-50/50 to-purple-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 border-b border-gray-200 dark:border-neutral-700 px-6 py-4 backdrop-blur-sm">
          <PageHeader
            icon={HelpCircle}
            title="FAQs"
            description="Manage frequently asked questions"
            action={
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New FAQ
              </button>
            }
          />

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden backdrop-blur-sm">
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading FAQs...</div>
            ) : filteredFAQs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No FAQs match your search' : `No FAQs in ${selectedCategory}`}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-neutral-700 border-b border-gray-200 dark:border-neutral-600">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedFAQs.length === filteredFAQs.length && filteredFAQs.length > 0}
                        onChange={toggleAllFAQs}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredFAQs.map(faq => (
                    <React.Fragment key={faq.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedFAQs.includes(faq.id)}
                            onChange={() => toggleFAQSelection(faq.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                            className="flex items-center gap-2 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full"
                          >
                            {expandedFAQ === faq.id ? (
                              <ChevronUp className="w-4 h-4 flex-shrink-0 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {faq.question}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-left">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-medium">
                            {faq.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-left">
                          {faq.isActive ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(faq)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedFAQ === faq.id && (
                        <tr className="bg-gray-50 dark:bg-neutral-800">
                          <td colSpan="5" className="px-4 py-4">
                            <div className="ml-8">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Answer:</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {faq.answer}
                              </p>
                              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700 text-xs text-gray-500 dark:text-gray-400">
                                <span>Created: {new Date(faq.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                >
                  {FAQ_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Question *
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  placeholder="Enter the question..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Answer *
                </label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  rows="6"
                  required
                  placeholder="Enter the answer..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 resize-y"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
                >
                  {isEditing ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setFaqToDelete(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
      />
    </div>
  );
};

export default FAQs;

