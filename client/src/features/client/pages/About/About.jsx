import Navbar from '../../../../components/Navbar';

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-brand-600 to-brand-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About RiderMind</h1>
              <p className="text-xl md:text-2xl text-brand-100 max-w-3xl mx-auto">
                Empowering riders with knowledge and skills for safer roads
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Our Mission</h2>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  To provide comprehensive, accessible, and engaging educational resources that empower riders with the knowledge 
                  and skills necessary to navigate roads safely and responsibly. We strive to reduce accidents and promote 
                  a culture of road safety awareness.
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Our Vision</h2>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  A future where every rider is well-informed, confident, and equipped with the knowledge to make safe decisions 
                  on the road. We envision a community where road safety education is not just a requirement, but a continuous 
                  journey of learning and improvement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-white dark:bg-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Why Choose RiderMind?</h2>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Our platform offers a unique learning experience designed specifically for riders
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Progressive Learning</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Learn at your own pace with our structured module system. Each module builds on the previous one, 
                  ensuring you master the fundamentals before advancing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Track Your Progress</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Monitor your learning journey with detailed progress tracking. See how far you've come and what's next 
                  in your road to mastery.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Compete & Excel</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Challenge yourself and compete with other learners on our leaderboards. See where you stand and 
                  strive for excellence.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Comprehensive Content</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Access a wide range of topics covering everything from basic road rules to advanced riding techniques 
                  and safety protocols.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Interactive Quizzes</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Test your knowledge with engaging quizzes at the end of each module. Reinforce your learning and 
                  ensure you're ready to move forward.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Learn Anytime</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Study whenever and wherever you want. Our platform is accessible 24/7, allowing you to learn on 
                  your schedule.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">How It Works</h2>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Get started with RiderMind in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-700">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 mt-2">Sign Up & Start</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Create your account and access our comprehensive library of learning modules tailored for riders.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-700">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 mt-2">Learn & Practice</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Progress through modules at your own pace. Complete quizzes to test your understanding and unlock new content.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 border border-neutral-200 dark:border-neutral-700">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 mt-2">Excel & Achieve</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Earn certificates, climb the leaderboards, and become a certified safe rider ready for the road.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
              Join thousands of riders who are improving their skills and road safety knowledge with RiderMind
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/modules"
                className="px-8 py-3 bg-white text-brand-700 font-semibold rounded-lg hover:bg-brand-50 transition-colors shadow-lg"
              >
                Browse Modules
              </a>
              <a
                href="/leaderboard"
                className="px-8 py-3 bg-brand-700 text-white font-semibold rounded-lg hover:bg-brand-800 transition-colors border-2 border-white shadow-lg"
              >
                View Leaderboard
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
