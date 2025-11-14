import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseSelection({ onComplete }) {
  const [step, setStep] = useState('category'); // 'category' or 'skillLevel' or 'terms'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Show terms modal after vehicle selection
    setTimeout(() => {
      setShowTermsModal(true);
    }, 600);
  };

  const handleSkillLevelSelect = (skillLevel) => {
    setSelectedSkillLevel(skillLevel);
    // Enroll immediately after skill level selection (terms already accepted)
    handleEnrollment(skillLevel);
  };

  const handleAcceptTerms = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to continue.');
      return;
    }

    setShowTermsModal(false);
    // Move to skill level selection after accepting terms
    setTimeout(() => {
      setStep('skillLevel');
    }, 300);
  };

  const handleEnrollment = async (skillLevel) => {
    setIsCreating(true);

    try {
      // Get the user's token
      const token = localStorage.getItem('token');
      
      console.log('🚀 Sending enrollment request:', {
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        skillLevel: selectedSkillLevel
      });
      
      // Enroll in the selected category with the chosen skill level
      const response = await fetch('/api/student-modules/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          skillLevel: skillLevel || selectedSkillLevel
        })
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        console.log('✅ Enrollment successful!');
        // Wait a bit for success animation
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to enroll');
      }
    } catch (error) {
      console.error('❌ Failed to create student module:', error);
      setIsCreating(false);
      alert('Failed to start your course. Please try again.');
    }
  };

  const skillLevels = [
    {
      level: 'Beginner',
      icon: '🌱',
      title: 'Beginner',
      description: 'Perfect for those just starting out',
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'from-green-600 to-emerald-700'
    },
    {
      level: 'Intermediate',
      icon: '🚀',
      title: 'Intermediate',
      description: 'You have some experience',
      color: 'from-blue-500 to-cyan-600',
      hoverColor: 'from-blue-600 to-cyan-700'
    },
    {
      level: 'Expert',
      icon: '⭐',
      title: 'Expert',
      description: 'Advanced knowledge and skills',
      color: 'from-purple-500 to-pink-600',
      hoverColor: 'from-purple-600 to-pink-700'
    }
  ];

  const categoryIcons = {
    'MOTORCYCLE': '🏍️',
    'CAR': '🚗'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-neutral-900 dark:to-neutral-800">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-8xl mb-6"
          >
            {categoryIcons[selectedCategory?.vehicleType] || '🎓'}
          </motion.div>
          <h2 className="text-3xl font-black text-neutral-800 dark:text-white mb-2">
            Creating Your Course...
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Get ready to start your learning journey!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <motion.div
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold ${
                step === 'category'
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'bg-green-500 text-white'
              }`}
              animate={step === 'skillLevel' ? { scale: [1, 1.1, 1] } : {}}
            >
              <span>{step === 'category' ? '1️⃣' : '✅'}</span>
              <span>Choose Vehicle</span>
            </motion.div>
            
            <div className="w-16 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-600"
                initial={{ width: '0%' }}
                animate={{ width: step === 'skillLevel' ? '100%' : '0%' }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <motion.div
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold ${
                step === 'skillLevel'
                  ? 'bg-brand-600 text-white shadow-lg'
                  : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span>2️⃣</span>
              <span>Pick Your Level</span>
            </motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl font-black text-neutral-800 dark:text-white mb-4">
                  Choose Your Vehicle Type
                </h1>
                <p className="text-xl text-neutral-600 dark:text-neutral-400">
                  Select the type of vehicle you want to learn about
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategorySelect(category)}
                    className={`relative cursor-pointer bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-xl border-4 transition-all ${
                      selectedCategory?.id === category.id
                        ? 'border-brand-600 ring-4 ring-brand-200'
                        : 'border-transparent hover:border-brand-400'
                    }`}
                  >
                    {/* Selection Checkmark */}
                    <AnimatePresence>
                      {selectedCategory?.id === category.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                        >
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="text-center">
                      <motion.div
                        className="text-8xl mb-6"
                        animate={selectedCategory?.id === category.id ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {categoryIcons[category.vehicleType]}
                      </motion.div>
                      <h2 className="text-3xl font-black text-neutral-800 dark:text-white mb-3">
                        {category.name}
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        {category.description || `Learn everything about ${category.vehicleType.toLowerCase()} safety and operation`}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-bold">
                        <span>📚</span>
                        <span>Comprehensive Training Program</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'skillLevel' && (
            <motion.div
              key="skillLevel"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Back Button */}
              <motion.button
                onClick={() => {
                  setStep('category');
                  setSelectedCategory(null);
                  setTermsAccepted(false);
                }}
                className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 font-bold mb-8 transition-colors"
                whileHover={{ x: -5 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Vehicle Selection</span>
              </motion.button>

              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-7xl mb-4 inline-block"
                >
                  {categoryIcons[selectedCategory?.vehicleType]}
                </motion.div>
                <h1 className="text-5xl font-black text-neutral-800 dark:text-white mb-4">
                  What's Your Skill Level?
                </h1>
                <p className="text-xl text-neutral-600 dark:text-neutral-400">
                  Choose your current experience level with {selectedCategory?.name.toLowerCase()}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {skillLevels.map((skill, index) => (
                  <motion.div
                    key={skill.level}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSkillLevelSelect(skill.level)}
                    className={`relative cursor-pointer bg-gradient-to-br ${skill.color} hover:${skill.hoverColor} rounded-2xl p-8 shadow-xl text-white transition-all`}
                  >
                    {/* Selection Checkmark */}
                    <AnimatePresence>
                      {selectedSkillLevel === skill.level && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                        >
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="text-center">
                      <motion.div
                        className="text-6xl mb-4"
                        animate={selectedSkillLevel === skill.level ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {skill.icon}
                      </motion.div>
                      <h3 className="text-2xl font-black mb-2">{skill.title}</h3>
                      <p className="text-white/90 mb-4">{skill.description}</p>
                      
                      {/* Feature list based on level */}
                      <div className="text-left text-sm space-y-2 bg-white/10 rounded-lg p-4">
                        {skill.level === 'Beginner' && (
                          <>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>Start with basics</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>Step-by-step guidance</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>Fundamental concepts</span>
                            </div>
                          </>
                        )}
                        {skill.level === 'Intermediate' && (
                          <>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>Build on basics</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>Advanced techniques</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>Real-world scenarios</span>
                            </div>
                          </>
                        )}
                        {skill.level === 'Expert' && (
                          <>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>All content unlocked</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>Expert challenges</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>✓</span>
                              <span>Mastery-level material</span>
                            </div>
                          </>
                        )}
                      </div>

                      <motion.div
                        className="mt-6 bg-white/20 rounded-lg px-6 py-3 font-bold"
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                      >
                        Select {skill.title}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 max-w-2xl mx-auto"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div className="text-left">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Don't worry!</h4>
                    <p className="text-blue-800 dark:text-blue-400 text-sm">
                      Your skill level determines which lessons you'll see. Beginners see foundational content, 
                      while intermediate and expert levels include progressively advanced material. You can always 
                      update your level later in your settings.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (!isCreating) {
                setShowTermsModal(false);
                setTermsAccepted(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">📜</div>
                  <div>
                    <h3 className="text-2xl font-bold">Terms and Conditions</h3>
                    <p className="text-blue-100 text-sm">Please read and accept to continue</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4 text-gray-700 dark:text-gray-300">
                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">1. Course Enrollment</h4>
                  <p className="text-sm leading-relaxed">
                    By enrolling in this course, you agree to complete the training modules in the order presented. 
                    You acknowledge that safe driving practices are essential and commit to applying the knowledge 
                    gained from this program responsibly.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">2. Learning Commitment</h4>
                  <p className="text-sm leading-relaxed">
                    You are responsible for completing all required modules, quizzes, and assessments. 
                    Progress tracking is provided to help you monitor your learning journey. Completion 
                    certificates will only be issued upon successful completion of all course requirements.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">3. Content Usage</h4>
                  <p className="text-sm leading-relaxed">
                    All course materials, videos, and content are proprietary to RiderMind. You may access 
                    these materials for personal educational use only. Redistribution, sharing, or commercial 
                    use of course content is strictly prohibited.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">4. Safety Disclaimer</h4>
                  <p className="text-sm leading-relaxed">
                    While this course provides comprehensive training, it does not replace hands-on practical 
                    training or official licensing requirements. Always follow local traffic laws and regulations. 
                    RiderMind is not liable for any incidents that occur during or after training.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">5. Privacy and Data</h4>
                  <p className="text-sm leading-relaxed">
                    Your learning progress, quiz results, and personal information will be stored securely. 
                    We respect your privacy and will not share your data with third parties without your consent.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    disabled={isCreating}
                  />
                  <label 
                    htmlFor="acceptTerms" 
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    I have read and agree to the Terms and Conditions. I understand my responsibilities 
                    as a learner and commit to safe driving practices.
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowTermsModal(false);
                      setTermsAccepted(false);
                    }}
                    disabled={isCreating}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAcceptTerms}
                    disabled={!termsAccepted || isCreating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <span>Accept & Continue</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

