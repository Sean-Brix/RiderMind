import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../../components/Navbar';
import { getAllFAQs, getFAQsByCategory } from '../../../../services/faqService';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'General', label: 'General', icon: '❓' },
    { value: 'Module', label: 'Module', icon: '📖' },
    { value: 'System', label: 'System', icon: '⚙️' },
    { value: 'Quiz', label: 'Quiz', icon: '✏️' }
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    filterFAQs();
  }, [selectedCategory, searchQuery, faqs]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await getAllFAQs(); // Get all FAQs
      console.log('FAQ Response:', response);
      if (response.success) {
        console.log('FAQs loaded:', response.data);
        setFaqs(response.data);
      } else {
        console.error('Failed to load FAQs:', response);
        setError('Failed to load FAQs');
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterFAQs = () => {
    console.log('Filtering FAQs. Total FAQs:', faqs);
    console.log('Selected Category:', selectedCategory);
    console.log('Search Query:', searchQuery);
    
    let filtered = faqs;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
      console.log('After category filter:', filtered);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
      console.log('After search filter:', filtered);
    }

    console.log('Final filtered FAQs:', filtered);
    setFilteredFaqs(filtered);
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading FAQs...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-brand-600 to-brand-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-xl text-brand-100 max-w-3xl mx-auto">
                Find answers to common questions about RiderMind
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700"
          >
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedCategory === category.value
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FAQ List */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {filteredFaqs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                No FAQs found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchQuery ? 'Try adjusting your search query' : 'No FAQs available in this category'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 text-neutral-600 dark:text-neutral-400"
              >
                Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'}
              </motion.div>

              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-2xl mt-1">❓</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                          {faq.question}
                        </h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded">
                          {categories.find(c => c.value === faq.category)?.label || faq.category}
                        </span>
                      </div>
                    </div>
                    <motion.svg
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-6 h-6 text-neutral-400 flex-shrink-0 ml-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 pl-20">
                          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-green-500 font-bold">A:</span>
                              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed flex-1 whitespace-pre-wrap">
                                {faq.answer}
                              </p>
                            </div>
                            {faq.updatedAt && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                                Last updated: {new Date(faq.updatedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-xl p-8 text-center text-white"
          >
            <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
            <p className="text-brand-100 mb-6">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <a
              href="mailto:support@ridermind.com"
              className="inline-block px-6 py-3 bg-white text-brand-700 font-semibold rounded-lg hover:bg-brand-50 transition-colors shadow-lg"
            >
              Contact Support
            </a>
          </motion.div>
        </section>
      </div>
    </>
  );
}
