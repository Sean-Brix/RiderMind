import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar.jsx';

export default function Landing() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-neutral-900 dark:to-neutral-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              Master Road Safety with
              <span className="block text-brand-700 dark:text-brand-400 mt-2">Rider Mind</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 mb-8 max-w-3xl mx-auto">
              Interactive e-learning platform for motorcycle and car drivers using 2D animation, scenario learning, and micro-learning approaches
            </p>
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/modules" className="btn btn-primary text-lg px-8 py-3">
                  Continue Learning
                </Link>
                <Link to="/progress" className="btn btn-secondary text-lg px-8 py-3">
                  View Progress
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login" className="btn btn-primary text-lg px-8 py-3">
                  Get Started
                </Link>
                <a href="#about" className="btn btn-secondary text-lg px-8 py-3">
                  Learn More
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Comprehensive Learning System
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Everything you need to become a safe and confident driver
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-brand-700 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                Why Choose Rider Mind?
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                Rider Mind is a web-based interactive e-learning platform designed to teach road safety to motorcycle 
                and car drivers through innovative 2D animation, scenario-based learning, and micro-learning approaches.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-brand-600 dark:bg-brand-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-100 to-brand-200 dark:from-neutral-800 dark:to-neutral-700 rounded-lg p-8">
              <div className="space-y-6">
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    📚 Comprehensive Modules
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Traffic signs, speed management, hazard spotting, and driving procedures
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    🎯 Pre-Assessment System
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Test your knowledge before advancing to ensure mastery of previous content
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    🎓 Verified Certification
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Digital certificates with unique Reference IDs for credential verification
                  </p>
                </div>
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    🛡️ Content Protection
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Security measures to protect exclusive learning materials
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-brand-700 dark:bg-brand-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-brand-100 mb-8">
              Join Rider Mind today and become a safer, more confident driver
            </p>
            <Link to="/login" className="inline-block bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-neutral-100 transition-colors">
              Enroll Now
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-neutral-900 dark:bg-black text-neutral-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Column */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Rider Mind</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Interactive e-learning platform for road safety education using 2D animation and scenario-based learning.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.63 13.73l-2.997-.935c-.653-.204-.658-.653.136-.967l11.722-4.517c.542-.198 1.02.128.842.966z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
                <li><a href="#about" className="text-sm hover:text-white transition-colors">About</a></li>
                <li><Link to="/modules" className="text-sm hover:text-white transition-colors">Modules</Link></li>
                <li><a href="#features" className="text-sm hover:text-white transition-colors">Features</a></li>
                <li><Link to="/login" className="text-sm hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            {/* Learning Resources */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Learning</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-white transition-colors">Traffic Signs</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Speed Management</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Hazard Spotting</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Driving Procedures</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Assessments</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Feedback</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-neutral-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-neutral-400">
                © {new Date().getFullYear()} Rider Mind. All rights reserved.
              </p>
              <p className="text-sm text-neutral-400 mt-4 md:mt-0">
                Compliant with Philippine Traffic Code (RA 4136) and LTO regulations
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
