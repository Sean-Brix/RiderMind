import { useState } from 'react';
import Certificate from '../../../../../components/Certificate';
import Modal from '../../../../../components/Modal';

/**
 * Certificate Tool - Test Certificate component
 */
function CertificateTool() {
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState({
    fullName: 'Juan Dela Cruz',
    vehicleCategory: 'Motorcycle - Class A',
    accountId: 'ACC-2024-001',
    dateIssued: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    certificateTitle: 'Certificate of Completion',
    issuerName: 'RiderMind'
  });

  const handleInputChange = (field, value) => {
    setCertificateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownloadPDF = async () => {
    try {
      // Dynamic import of html2canvas and jsPDF
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const certificate = document.querySelector('.certificate');
      if (!certificate) return;

      // Capture the certificate as canvas
      const canvas = await html2canvas(certificate, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Convert to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificate-${certificateData.accountId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6 ">
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
          Certificate Configuration
        </h3>
        
        {/* Certificate Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={certificateData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Vehicle Category
            </label>
            <input
              type="text"
              value={certificateData.vehicleCategory}
              onChange={(e) => handleInputChange('vehicleCategory', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Motorcycle - Class A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Account ID
            </label>
            <input
              type="text"
              value={certificateData.accountId}
              onChange={(e) => handleInputChange('accountId', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., ACC-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Date Issued
            </label>
            <input
              type="text"
              value={certificateData.dateIssued}
              onChange={(e) => handleInputChange('dateIssued', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., November 21, 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Certificate Title
            </label>
            <input
              type="text"
              value={certificateData.certificateTitle}
              onChange={(e) => handleInputChange('certificateTitle', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Certificate of Completion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Issuer Name
            </label>
            <input
              type="text"
              value={certificateData.issuerName}
              onChange={(e) => handleInputChange('issuerName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., RiderMind"
            />
          </div>
        </div>

        <button
          onClick={() => setShowCertificate(true)}
          className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
        >
          Open Certificate Modal
        </button>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <Modal isOpen={showCertificate} onClose={() => setShowCertificate(false)} size="max">
          <div className="p-8">
            <Certificate
              fullName={certificateData.fullName}
              vehicleCategory={certificateData.vehicleCategory}
              accountId={certificateData.accountId}
              dateIssued={certificateData.dateIssued}
              certificateTitle={certificateData.certificateTitle}
              issuerName={certificateData.issuerName}
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
    </div>
  );
}

export default CertificateTool;
