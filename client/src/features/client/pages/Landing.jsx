import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import { getMyModules } from '../../../services/studentModuleService';

export default function Landing() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [hasModules, setHasModules] = useState(true); // Default to true to show "Continue Learning" initially
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    const checkForModules = async () => {
      if (!user) {
        setLoadingModules(false);
        return;
      }

      try {
        // Use checkOnly=true to avoid auto-enrolling when just checking
        const response = await getMyModules(null, true);
        if (response.success && response.data.modules) {
          // User has modules if any exist in the response
          setHasModules(response.data.modules.length > 0);
        }
      } catch (error) {
        console.error('Failed to check for modules:', error);
        // On error, default to true to avoid breaking existing functionality
        setHasModules(true);
      } finally {
        setLoadingModules(false);
      }
    };

    checkForModules();
  }, [user]);
  
  const features = [
    {
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      title: 'User Registration & Login',
      description: 'Secure account creation with role-based access for Admin and Learners, ensuring privacy and progress tracking.',
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Interactive Dashboard',
      description: 'Track your progress, module completion, and upcoming lessons with a comprehensive learner dashboard.',
    },
    {
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      title: 'Scenario-Based Learning',
      description: 'Master road safety through 2D animated scenarios covering traffic signs, hazard spotting, and driving procedures.',
    },
    {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Interactive Assessments',
      description: 'Test your knowledge with quizzes and practice exercises featuring instant feedback and score tracking.',
    },
    {
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      title: 'Progress Tracking',
      description: 'Monitor completion status, quiz scores, and performance metrics to continue from where you left off.',
    },
    {
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      title: 'Digital Certification',
      description: 'Earn downloadable certificates with unique reference IDs upon completing all modules and assessments.',
    },
  ];

  const benefits = [
    {
      title: 'LTO-Validated Lessons',
      description: 'All content is validated by certified driving instructors and aligned with Philippine Traffic Code (RA 4136).',
    },
    {
      title: 'Exclusive Access',
      description: 'Learning modules are restricted to enrolled students only, protecting intellectual property and privacy.',
    },
    {
      title: 'Micro-Learning Approach',
      description: 'Bite-sized lessons designed for better knowledge retention and flexible learning schedules.',
    },
    {
      title: 'Interactive Scenarios',
      description: 'Engage with real-world driving situations through 2D animations and decision-making exercises.',
    },
  ];

  const stats = [
    { value: '20+', label: 'Learning Modules' },
    { value: '300+', label: 'Interactive Lessons' },
    { value: '500+', label: 'Practice Questions' },
    { value: '100%', label: 'LTO Compliant' },
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'New Driver',
      avatar: 'MS',
      comment: 'The interactive lessons made learning traffic rules so much easier! I passed my LTO exam on the first try.',
      rating: 5,
    },
    {
      name: 'Juan Dela Cruz',
      role: 'Motorcycle Rider',
      avatar: 'JD',
      comment: 'The scenario-based approach really helped me understand real-world driving situations. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Anna Reyes',
      role: 'Car Driver',
      avatar: 'AR',
      comment: 'Flexible learning schedule was perfect for my busy lifestyle. The animations make complex concepts simple.',
      rating: 5,
    },
  ];

  const pricingFeatures = [
    'Access to 20+ comprehensive modules',
    'Interactive 2D animated lessons',
    'Unlimited quiz attempts',
    'Progress tracking dashboard',
    'Digital certification upon completion',
    'LTO-validated content',
    'Mobile-friendly platform',
    '24/7 learning access',
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 dark:from-brand-900 dark:via-brand-950 dark:to-black py-24 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">LTO-Certified Driving Education</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Learn to Drive Safely,
              <span className="block text-yellow-400 mt-2">Master the Roads</span>
            </h1>
            <p className="text-xl md:text-2xl text-brand-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of Filipinos who've mastered road safety with our interactive, 
              LTO-validated e-learning platform. Start your journey to becoming a confident driver today.
            </p>

            {/* CTA Buttons */}
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/modules" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                  {loadingModules ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : hasModules ? (
                    <>Continue Learning <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span></>
                  ) : (
                    <>Start Course <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span></>
                  )}
                </Link>
                <Link to="/progress" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  View Progress
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/login" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-brand-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                  Enroll Now - Start Learning
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <a href="#pricing" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  View Plans & Pricing
                </a>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-brand-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">LTO Validated</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Expert Instructors</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Digital Certification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="currentColor" className="text-neutral-50 dark:text-neutral-950"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-brand-700 dark:text-brand-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold mb-4">
              COMPREHENSIVE LEARNING EXPERIENCE
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with expert instruction to deliver 
              the most effective road safety education available in the Philippines.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-2xl hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold mb-6">
                WHY CHOOSE US
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                The Future of Driver Education is Here
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                Rider Mind revolutionizes road safety education with interactive 2D animations, 
                real-world scenarios, and bite-sized lessons. Whether you're learning to drive a 
                motorcycle or car, our LTO-validated platform ensures you're fully prepared for the road ahead.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-2">
                        {benefit.title}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-4">
                  {[
                    { icon: '📚', title: 'Comprehensive Modules', desc: 'Traffic signs, speed management, hazard spotting, and driving procedures' },
                    { icon: '🎯', title: 'Pre-Assessment System', desc: 'Test your knowledge before advancing to ensure mastery' },
                    { icon: '🎓', title: 'Verified Certification', desc: 'Digital certificates with unique Reference IDs' },
                    { icon: '🛡️', title: 'Content Protection', desc: 'Security measures to protect exclusive materials' },
                  ].map((item, index) => (
                    <div key={index} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                            {item.title}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-brand-50 dark:from-neutral-950 dark:to-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold mb-4">
              STUDENT SUCCESS STORIES
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Trusted by Filipino Drivers
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              See what our students have to say about their learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold mb-4">
              SIMPLE, TRANSPARENT PRICING
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Start Your Journey Today
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Get complete access to all learning modules, quizzes, and certifications
            </p>
          </div>

          <div className="relative">
            {/* Popular Badge */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                🔥 Most Popular
              </span>
            </div>

            <div className="bg-gradient-to-br from-brand-600 to-brand-800 dark:from-brand-700 dark:to-brand-900 rounded-3xl shadow-2xl p-10 md:p-12 text-white border-4 border-yellow-400">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">Complete Driver Education</h3>
                <div className="flex items-end justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold">Free</span>
                </div>
                <p className="text-brand-100">Full access to all features and content</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {pricingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-brand-50">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                {user ? (
                  <Link
                    to="/modules"
                    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-brand-900 font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    Access Your Courses Now →
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-brand-900 font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started for Free →
                  </Link>
                )}
                <p className="text-brand-100 text-sm mt-4">
                  ✓ No credit card required · ✓ Start learning immediately
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="text-3xl mb-2">💳</div>
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">No Hidden Fees</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">100% free access to all content</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">Unlimited Access</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Learn at your own pace, anytime</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-2">🎓</div>
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">Certification Included</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Get certified upon completion</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="relative py-24 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 dark:from-brand-900 dark:via-black dark:to-neutral-950 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <span className="font-semibold">Join Our Driving School Today</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Become a
              <span className="block text-yellow-400 mt-2">Safe & Confident Driver?</span>
            </h2>
            <p className="text-xl md:text-2xl text-brand-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of Filipinos who've mastered road safety. Start your free course today 
              and get certified by LTO-validated instructors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                to="/login" 
                className="group inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-brand-900 font-bold text-lg px-10 py-4 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
              >
                Start Learning for Free
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a 
                href="#features" 
                className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold text-lg px-10 py-4 rounded-xl border-2 border-white/30 hover:border-white/50 transition-all duration-200"
              >
                Learn More
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-brand-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">No credit card needed</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">100% free forever</span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-brand-400 rounded-full opacity-20 blur-3xl"></div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-neutral-900 dark:bg-black text-neutral-300 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* About Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-xl">Rider Mind</h3>
              </div>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                Your trusted partner in road safety education. LTO-validated courses for motorcycles and cars.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-neutral-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.63 13.73l-2.997-.935c-.653-.204-.658-.653.136-.967l11.722-4.517c.542-.198 1.02.128.842.966z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Home
                  </Link>
                </li>
                <li>
                  <a href="#about" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> About Us
                  </a>
                </li>
                <li>
                  <Link to="/modules" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Courses
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Learning Resources */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Learning Modules</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Traffic Signs & Rules
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Defensive Driving
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Road Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Practice Quizzes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Certification
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-brand-400 transition-colors flex items-center gap-2">
                    <span className="text-brand-500">›</span> Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-neutral-400">
                © {new Date().getFullYear()} Rider Mind. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>LTO-Certified · RA 4136 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
