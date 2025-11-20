import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Certificate from './Certificate';

/**
 * CongratulationsModal - Celebration modal shown when student completes all modules
 * Features:
 * - Confetti animation
 * - Progress summary
 * - Certificate download
 */
export default function CongratulationsModal({ 
  isOpen, 
  onClose, 
  studentData,
  categoryData,
  onDownloadCertificate 
}) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Generate confetti pieces
  useEffect(() => {
    if (isOpen) {
      const pieces = [];
      const colors = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#fcd34d'];
      
      for (let i = 0; i < 100; i++) {
        pieces.push({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          left: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 3 + Math.random() * 2,
          rotation: Math.random() * 360,
          size: 8 + Math.random() * 8
        });
      }
      setConfettiPieces(pieces);
    }
  }, [isOpen]);

  const handleDownloadPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const certificate = document.querySelector('.certificate');
      if (!certificate) return;

      const canvas = await html2canvas(certificate, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificate-${studentData?.accountId || 'RiderMind'}.pdf`);
      
      if (onDownloadCertificate) {
        onDownloadCertificate();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const calculateStats = () => {
    if (!categoryData) return { totalModules: 0, completedModules: 0, totalQuizzes: 0, averageScore: 0 };

    const modules = categoryData.modules || [];
    const completedModules = modules.filter(m => m.isCompleted).length;
    
    let totalQuizzes = 0;
    let totalScore = 0;
    let quizCount = 0;

    modules.forEach(module => {
      if (module.quiz) {
        totalQuizzes++;
        if (module.quizScore !== null && module.quizScore !== undefined) {
          totalScore += module.quizScore;
          quizCount++;
        }
      }
    });

    const averageScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;

    return {
      totalModules: modules.length,
      completedModules,
      totalQuizzes,
      averageScore
    };
  };

  const stats = calculateStats();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xlarge">
        <div className="relative overflow-hidden">
          {/* Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="absolute animate-confetti-fall"
                style={{
                  left: `${piece.left}%`,
                  top: '-20px',
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  backgroundColor: piece.color,
                  animationDelay: `${piece.delay}s`,
                  animationDuration: `${piece.duration}s`,
                  transform: `rotate(${piece.rotation}deg)`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '0'
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Celebration Header */}
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400">
                You've completed all modules in <span className="font-semibold text-brand-600">{categoryData?.name || 'this category'}</span>!
              </p>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-700">
                <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">
                  {stats.completedModules}/{stats.totalModules}
                </div>
                <div className="text-sm text-green-600 dark:text-green-500 font-medium">
                  Modules Completed
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                  {stats.totalQuizzes}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-500 font-medium">
                  Quizzes Taken
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700">
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-1">
                  {stats.averageScore}%
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-500 font-medium">
                  Average Score
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6 border-2 border-amber-200 dark:border-amber-700">
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-400 mb-1">
                  100%
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-500 font-medium">
                  Completion Rate
                </div>
              </div>
            </div>

            {/* Module Details */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 mb-8 max-h-64 overflow-y-auto">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Your Progress Summary
              </h3>
              <div className="space-y-3">
                {categoryData?.modules?.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between bg-white dark:bg-neutral-700 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        module.isCompleted 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-neutral-100 dark:bg-neutral-600'
                      }`}>
                        {module.isCompleted ? (
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {module.title}
                        </p>
                        {module.quiz && module.quizScore !== null && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Quiz Score: {module.quizScore}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowCertificate(true)}
                className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Certificate
              </button>
              
              <button
                onClick={onClose}
                className="px-8 py-4 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Certificate Preview Modal */}
      {showCertificate && (
        <Modal isOpen={showCertificate} onClose={() => setShowCertificate(false)} size="max">
          <div className="p-8">
            <Certificate
              fullName={studentData?.fullName || 'Student Name'}
              vehicleCategory={categoryData?.name || 'Vehicle Category'}
              accountId={studentData?.accountId || 'ACC-000'}
              dateIssued={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              certificateTitle="Certificate of Completion"
              issuerName="RiderMind"
            />
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-6 py-3 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confetti Animation Styles */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear infinite;
        }
      `}</style>
    </>
  );
}

CongratulationsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  studentData: PropTypes.shape({
    fullName: PropTypes.string,
    accountId: PropTypes.string,
  }),
  categoryData: PropTypes.shape({
    name: PropTypes.string,
    modules: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        isCompleted: PropTypes.bool,
        quiz: PropTypes.object,
        quizScore: PropTypes.number,
      })
    ),
  }),
  onDownloadCertificate: PropTypes.func,
};
